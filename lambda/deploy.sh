#!/bin/bash
# ============================================================
# DevOS Chat Lambda — One-command deploy
# ============================================================
# Prerequisites: aws cli configured, node/npm installed
#
# Usage:
#   export ANTHROPIC_API_KEY="sk-ant-..."
#   ./deploy.sh
#
# This script:
#   1. Creates DynamoDB table (devos-chat)
#   2. Creates IAM role (devos-chat-lambda-role)
#   3. Installs dependencies & zips function
#   4. Creates/updates Lambda function
#   5. Creates Function URL (public, with CORS)
#   6. Prints the endpoint URL → paste into filesystem.js
# ============================================================

set -euo pipefail

REGION="us-east-1"
FUNC_NAME="devos-chat"
ROLE_NAME="devos-chat-lambda-role"
TABLE_NAME="devos-chat"
ALLOWED_ORIGIN="https://sidashen.com"
MONTHLY_CAP="10"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHAT_DIR="$SCRIPT_DIR/chat"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[DevOS Chat] Starting deployment...${NC}"

# ── Check API key ────────────────────────────────────────────
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo -e "${RED}Error: ANTHROPIC_API_KEY not set${NC}"
  echo "Run: export ANTHROPIC_API_KEY=\"sk-ant-...\""
  exit 1
fi

# ── 1. DynamoDB table ────────────────────────────────────────
echo -e "${YELLOW}[1/5] Creating DynamoDB table...${NC}"
if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &>/dev/null; then
  echo "  Table '$TABLE_NAME' already exists, skipping."
else
  aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=PK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --no-cli-pager

  # Enable TTL for rate limit entries
  aws dynamodb update-time-to-live \
    --table-name "$TABLE_NAME" \
    --time-to-live-specification "Enabled=true, AttributeName=ttl" \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || true

  echo "  Table '$TABLE_NAME' created."
fi

# ── 2. IAM role ──────────────────────────────────────────────
echo -e "${YELLOW}[2/5] Setting up IAM role...${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'

if aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
  echo "  Role '$ROLE_NAME' already exists, skipping."
else
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "$TRUST_POLICY" \
    --no-cli-pager
  echo "  Role created."
fi

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Attach policies
aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
  --no-cli-pager 2>/dev/null || true

# Inline policy for DynamoDB access
DDB_POLICY="{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Effect\": \"Allow\",
    \"Action\": [\"dynamodb:GetItem\", \"dynamodb:UpdateItem\", \"dynamodb:PutItem\"],
    \"Resource\": \"arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE_NAME}\"
  }]
}"

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "devos-chat-ddb" \
  --policy-document "$DDB_POLICY" \
  --no-cli-pager

echo "  Policies attached."

# ── 3. Package function ──────────────────────────────────────
echo -e "${YELLOW}[3/5] Packaging Lambda function...${NC}"
cd "$CHAT_DIR"
npm install --omit=dev --silent
zip -r -q /tmp/devos-chat.zip . -x "*.DS_Store"
echo "  Packaged to /tmp/devos-chat.zip"

# ── 4. Create/update Lambda ──────────────────────────────────
echo -e "${YELLOW}[4/5] Deploying Lambda function...${NC}"

# Wait for role propagation
sleep 5

if aws lambda get-function --function-name "$FUNC_NAME" --region "$REGION" &>/dev/null; then
  aws lambda update-function-code \
    --function-name "$FUNC_NAME" \
    --zip-file fileb:///tmp/devos-chat.zip \
    --region "$REGION" \
    --no-cli-pager

  # Wait for update to complete
  aws lambda wait function-updated --function-name "$FUNC_NAME" --region "$REGION"

  aws lambda update-function-configuration \
    --function-name "$FUNC_NAME" \
    --environment "Variables={ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY},MONTHLY_CAP_USD=${MONTHLY_CAP},ALLOWED_ORIGIN=${ALLOWED_ORIGIN}}" \
    --timeout 30 \
    --memory-size 256 \
    --region "$REGION" \
    --no-cli-pager

  echo "  Function updated."
else
  aws lambda create-function \
    --function-name "$FUNC_NAME" \
    --runtime nodejs20.x \
    --handler index.handler \
    --role "$ROLE_ARN" \
    --zip-file fileb:///tmp/devos-chat.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment "Variables={ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY},MONTHLY_CAP_USD=${MONTHLY_CAP},ALLOWED_ORIGIN=${ALLOWED_ORIGIN}}" \
    --region "$REGION" \
    --no-cli-pager

  echo "  Function created."

  # Wait for function to be active
  aws lambda wait function-active --function-name "$FUNC_NAME" --region "$REGION"
fi

# ── 5. Function URL ──────────────────────────────────────────
echo -e "${YELLOW}[5/5] Setting up Function URL...${NC}"

FUNC_URL=$(aws lambda get-function-url-config \
  --function-name "$FUNC_NAME" \
  --region "$REGION" \
  --query 'FunctionUrl' --output text 2>/dev/null || echo "")

if [ -z "$FUNC_URL" ] || [ "$FUNC_URL" = "None" ]; then
  FUNC_URL=$(aws lambda create-function-url-config \
    --function-name "$FUNC_NAME" \
    --auth-type NONE \
    --cors "{\"AllowOrigins\":[\"${ALLOWED_ORIGIN}\",\"http://localhost:8080\"],\"AllowMethods\":[\"POST\",\"OPTIONS\"],\"AllowHeaders\":[\"Content-Type\"],\"MaxAge\":86400}" \
    --region "$REGION" \
    --query 'FunctionUrl' --output text \
    --no-cli-pager)

  # Allow public invocation
  aws lambda add-permission \
    --function-name "$FUNC_NAME" \
    --statement-id "FunctionURLPublic" \
    --action "lambda:InvokeFunctionUrl" \
    --principal "*" \
    --function-url-auth-type NONE \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || true

  echo "  Function URL created."
else
  echo "  Function URL already exists."
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Deployment complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  Function URL: ${YELLOW}${FUNC_URL}${NC}"
echo ""
echo "  Next steps:"
echo "  1. Copy the URL above"
echo "  2. Paste it into js/filesystem.js → LLM_CONFIG.endpoint"
echo "  3. Push to GitHub Pages"
echo ""

# Cleanup
rm -f /tmp/devos-chat.zip
