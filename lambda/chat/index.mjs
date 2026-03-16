/**
 * DevOS Chat Lambda — Anthropic Claude proxy with rate limiting & spend cap.
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY  — your Anthropic API key
 *   MONTHLY_CAP_USD    — monthly spend cap in USD (default: 10)
 *   ALLOWED_ORIGIN     — CORS origin (default: https://sidashen.com)
 *
 * DynamoDB table: devos-chat (created by deploy.sh)
 *   PK = "spend#YYYY-MM"   → { totalInputTokens, totalOutputTokens }
 *   PK = "rate#<ip>#<min>"  → { count } with TTL
 */

import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({});
const TABLE = 'devos-chat';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_OUTPUT_TOKENS = 1024;
const MAX_HISTORY_TURNS = 6;
const RATE_LIMIT_PER_MIN = 10;

// Haiku 4.5 pricing per million tokens
const INPUT_COST_PER_M = 1.0;
const OUTPUT_COST_PER_M = 5.0;

const SYSTEM_PROMPT = `You are the AI assistant on Sida Shen's personal portfolio website (sidashen.com).
The website is styled as an Ubuntu desktop with a terminal emulator.
Users type into the terminal — if their input isn't a shell command, it comes to you.

Sida is male (he/him).
Answer questions about Sida's background, experience, projects, skills, writing, and speaking.
Be concise and friendly. Keep responses under 150 words unless the user asks for more detail.
Never make up information not present in the profile data below.
If asked something not covered, say you don't have that info and suggest emailing shenstan1@gmail.com.
Respond in the same language the user writes in (English or Chinese).
Do NOT use markdown formatting (no **, ##, etc) — output plain text only, since this renders in a terminal.

=== PROFILE DATA ===

--- about.txt ---
Sida Shen
Developer Marketing | Product Marketing | DevRel
Menlo Park, CA

I bridge the gap between deeply technical products and the developers who use them.

Currently leading Product Marketing, Developer Relations, and Technology Partnerships at CelerData -- the company behind StarRocks, a high-performance open-source analytics database used by companies like Airbnb, Lenovo, and Pinterest.

Previously: Solution Architect at Zilliz (Milvus vector database), where I helped teams at Walmart, eBay, and LINE integrate vector search into production ML pipelines.

Before that: Founded a learning management system for international medical students, growing it from zero to $30K ARR during COVID-19.

Education: MS & BS in Industrial Engineering, Penn State University.

--- resume.txt ---
EXPERIENCE

CelerData Inc. | Product Marketing Manager | May 2023 - Present
  - Leading Product Marketing, DevRel, and Tech Partnerships
  - Achieved 3x ARR growth in 2024
  - Scaled StarRocks Slack community to 4,000+ members
  - Built partnerships with Databricks, Apache Iceberg ecosystem
  - Published 25+ technical articles, delivered 15+ talks
  - Conducted 40+ user interviews to shape product direction

CelerData Inc. | Product Manager | Mar 2022 - Apr 2023
  - Led feature design and GTM for real-time analytics
  - Worked on StarRocks core: github.com/StarRocks/starrocks
  - Created tutorials, release notes, and feature deep dives

Zilliz | Solution Architect | May 2021 - Mar 2022
  - Drove enterprise adoption at Walmart, LINE, eBay
  - Grew Milvus GitHub stars from 5K to 10K in 10 months
  - Maintained: github.com/milvus-io/bootcamp

REEL | Founding Data Scientist | Feb 2020 - Apr 2021
  - Bootstrapped quiz-based LMS for medical students
  - Grew to $30K ARR within first year
  - Built backend with spaced learning algorithm (Python, MySQL)

EDUCATION
Penn State University | MS Industrial Eng. & Operations Research
Penn State University | BS Industrial Engineering

SKILLS
Python, SQL, Linux, Distributed Systems, OLAP, Apache Iceberg,
Machine Learning, Vector Databases, Technical Writing, DevRel

--- contact.txt ---
Email:    shenstan1@gmail.com
LinkedIn: https://www.linkedin.com/in/sida-shen-165303193/
Location: Menlo Park, CA, USA
Open to: Developer Marketing, DevRel, Product Marketing roles
         Advisory / consulting in open-source GTM strategy

--- skills.txt ---
PROGRAMMING: Python (NumPy, Pandas, Matplotlib, Torch, Spark), SQL
TECHNOLOGIES: Distributed Systems, Linux, OLAP Databases (StarRocks, ClickHouse, Druid), Apache Iceberg, Delta Lake, Hudi, Machine Learning, Vector Databases (Milvus)
MARKETING & GTM: Product Positioning & Messaging, Developer Relations & Community Building, Technical Content Strategy, Product Launches & Campaigns, Sales Enablement, Partnership Development, User Research (40+ interviews)

--- projects/starrocks.md ---
StarRocks @ CelerData — High-performance, real-time analytics database
https://github.com/StarRocks/starrocks
Role: Product Manager (2022-2023) -> Product Marketing Manager (2023-Present)
Key: 3x ARR growth 2024, 4K+ Slack community, 25+ articles, 15+ talks, partnerships with Databricks/Confluent/Iceberg, 40+ user interviews, spoke at Databricks Data+AI Summit

--- projects/milvus.md ---
Milvus @ Zilliz — Open-source vector database for AI applications
https://github.com/milvus-io/milvus
Role: Solution Architect & Bootcamp Maintainer (2021-2022)
Key: Enterprise adoption at Walmart/LINE/eBay, grew GitHub 5K->10K stars in 10 months, contributed to B+ round funding, presented at ITU AI for Good

--- projects/reel.md ---
REEL — B2B learning management system for medical schools
Role: Founding Data Scientist (2020-2021)
Key: Bootstrapped LMS, $30K ARR first year, Python/MySQL backend with spaced learning algo, 100%+ student engagement increase, secured seed funding during COVID-19

--- writing ---
25+ published articles at CelerData/StarRocks blog (celerdata.com/blog/author/sida-shen)
External: The New Stack, Delta.io, Preset Blog, insideAI News, Medium
Topics: real-time analytics, Apache Iceberg, StarRocks vs ClickHouse/Druid/Trino, denormalization

--- speaking ---
Conferences: StarRocks Summit 2025, Databricks Data+AI Summit 2024, ITU AI for Good
8+ webinars including StarRocks 4.0 launch, Demandbase case study, Pinterest deep dive
Podcasts: Data Engineering Podcast Ep 463, TFiR, Truth in IT, Authority Magazine
Video playlist: youtube.com/playlist?list=PLTXHtKIqm__dqxZYV8oQ-l7tRpSnftjmy

--- .plan (2026 goals) ---
Scale StarRocks community to 10K+ members, launch AI-native analytics developer experience, speak at 5+ major data/AI conferences, continue writing about open data architecture`;


// ── Helpers ──────────────────────────────────────────────────────────

// CORS is handled automatically by Lambda Function URL config.
// Do NOT add CORS headers in responses — duplicates cause browsers to reject.

function monthKey() {
  const d = new Date();
  return `spend#${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function minuteKey(ip) {
  const min = Math.floor(Date.now() / 60000);
  return `rate#${ip}#${min}`;
}

async function checkRateLimit(ip) {
  const key = minuteKey(ip);
  try {
    const res = await ddb.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { PK: { S: key } },
      UpdateExpression: 'ADD #c :one SET #t = if_not_exists(#t, :ttl)',
      ExpressionAttributeNames: { '#c': 'count', '#t': 'ttl' },
      ExpressionAttributeValues: {
        ':one': { N: '1' },
        ':ttl': { N: String(Math.floor(Date.now() / 1000) + 120) },
      },
      ReturnValues: 'ALL_NEW',
    }));
    const count = parseInt(res.Attributes.count.N, 10);
    return count <= RATE_LIMIT_PER_MIN;
  } catch {
    return true; // fail open
  }
}

async function checkSpendCap() {
  const cap = parseFloat(process.env.MONTHLY_CAP_USD || '10');
  try {
    const res = await ddb.send(new GetItemCommand({
      TableName: TABLE,
      Key: { PK: { S: monthKey() } },
    }));
    if (!res.Item) return true;
    const inTok = parseInt(res.Item.totalInputTokens?.N || '0', 10);
    const outTok = parseInt(res.Item.totalOutputTokens?.N || '0', 10);
    const cost = (inTok / 1_000_000) * INPUT_COST_PER_M + (outTok / 1_000_000) * OUTPUT_COST_PER_M;
    return cost < cap;
  } catch {
    return true;
  }
}

async function recordUsage(inputTokens, outputTokens) {
  try {
    await ddb.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { PK: { S: monthKey() } },
      UpdateExpression: 'ADD totalInputTokens :i, totalOutputTokens :o',
      ExpressionAttributeValues: {
        ':i': { N: String(inputTokens) },
        ':o': { N: String(outputTokens) },
      },
    }));
  } catch {
    // best effort
  }
}


// ── Handler ──────────────────────────────────────────────────────────

export async function handler(event) {
  // CORS preflight is handled automatically by Lambda Function URL config

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'messages required' }) };
  }

  // Log request
  const ip = event.requestContext?.http?.sourceIp || 'unknown';
  const userAgent = event.headers?.['user-agent'] || '';
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  console.log(JSON.stringify({ type: 'request', ip, userAgent, message: lastUserMsg, turns: messages.length }));

  // Rate limit
  if (!(await checkRateLimit(ip))) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }) };
  }

  // Spend cap
  if (!(await checkSpendCap())) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Chat is temporarily unavailable. Try again next month or email shenstan1@gmail.com.' }) };
  }

  // Trim to last N turns
  const trimmed = messages.slice(-MAX_HISTORY_TURNS * 2);

  // Call Anthropic (streaming)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const resp = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: SYSTEM_PROMPT,
        messages: trimmed,
        stream: true,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error', detail: errText }) };
    }

    // Collect streamed response and return as complete text
    // (Lambda Function URL doesn't support true streaming easily,
    //  so we collect and return. For streaming we'd need response streaming.)
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === 'content_block_delta' && evt.delta?.text) {
            fullText += evt.delta.text;
          }
          if (evt.type === 'message_delta' && evt.usage) {
            outputTokens = evt.usage.output_tokens || 0;
          }
          if (evt.type === 'message_start' && evt.message?.usage) {
            inputTokens = evt.message.usage.input_tokens || 0;
          }
        } catch {
          // skip unparseable
        }
      }
    }

    // Log response
    console.log(JSON.stringify({ type: 'response', ip, input_tokens: inputTokens, output_tokens: outputTokens, response: fullText }));

    // Record usage
    if (inputTokens || outputTokens) {
      await recordUsage(inputTokens, outputTokens);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: fullText,
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error', detail: err.message }),
    };
  }
}
