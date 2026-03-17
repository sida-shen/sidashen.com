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
const CACHE_WRITE_COST_PER_M = 1.25;
const CACHE_READ_COST_PER_M = 0.10;

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
When referencing content, include the URL so the user can click to read/watch.

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
  - Published 70+ technical articles, delivered 45+ talks
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
Key: 3x ARR growth 2024, 4K+ Slack community, 70+ articles, 45+ talks, partnerships with Databricks/Confluent/Iceberg, 40+ user interviews, spoke at Databricks Data+AI Summit

--- projects/milvus.md ---
Milvus @ Zilliz — Open-source vector database for AI applications
https://github.com/milvus-io/milvus
Role: Solution Architect & Bootcamp Maintainer (2021-2022)
Key: Enterprise adoption at Walmart/LINE/eBay, grew GitHub 5K->10K stars in 10 months, contributed to B+ round funding, presented at ITU AI for Good

--- projects/reel.md ---
REEL — B2B learning management system for medical schools
Role: Founding Data Scientist (2020-2021)
Key: Bootstrapped LMS, $30K ARR first year, Python/MySQL backend with spaced learning algo, 100%+ student engagement increase, secured seed funding during COVID-19

--- .plan (2026 goals) ---
Scale StarRocks community to 10K+ members, launch AI-native analytics developer experience, speak at 5+ major data/AI conferences, continue writing about open data architecture

=== CONTENT INDEX (119 items) ===

BLOG POSTS (70):
1. From Snowflake to StarRocks+Apache Iceberg: How Fanatics Cut 90% of Analytics Cost at 6PB Scale | CelerData Blog | 2026-03 | https://celerdata.com/blog/from-snowflake-to-starrocksapache-iceberg-how-fanatics-cut-90-of-analytics-cost-at-6pb-scale
2. 2026 Is When Open Data, Real-Time Analytics and AI Agents Converge | CelerData Blog | 2026-01 | https://celerdata.com/blog/2026-is-when-open-data-real-time-analytics-and-ai-agents-converge
3. From Hours to Seconds: How Yuno Accelerated Customer-Facing Analytics By Switching Off Snowflake and Athena | CelerData Blog | 2025-12 | https://celerdata.com/blog/from-hours-to-seconds-how-yuno-accelerated-customer-facing-analytics-by-switching-off-snowflake-and-athena
4. StarRocks 4.0: Bringing Native Columnar Performance to JSON | CelerData Blog | 2025-11 | https://celerdata.com/blog/starrocks-4.0-bringing-native-columnar-performance-to-json
5. StarRocks 4.0: Delivering Query-Ready Data to Apache Iceberg | CelerData Blog | 2025-10 | https://celerdata.com/blog/starrocks-4.0-delivering-query-ready-data-to-apache-iceberg
6. Announcing StarRocks 4.0: Open, Fast, Governed | CelerData Blog | 2025-09 | https://celerdata.com/blog/announcing-starrocks-4.0-open-fast-governed
7. Data Skew in Customer-Facing Analytics: The Hidden Cost Behind Latency | CelerData Blog | 2025-08 | https://celerdata.com/blog/data-skew-in-customer-facing-analytics-the-hidden-cost-behind-latency
8. Why Customer-Facing Analytics Needs More Than Just Fast | CelerData Blog | 2025-07 | https://celerdata.com/blog/why-customer-facing-analytics-needs-more-than-just-fast
9. Customer-Facing Analytics Without Denormalizing Everything | CelerData Blog | 2025-06 | https://celerdata.com/blog/customer-facing-analytics-without-denormalizing-everything
10. Demandbase Ditches Denormalization By Switching off ClickHouse | CelerData Blog | 2025-05 | https://celerdata.com/blog/demandbase-ditches-denormalization-by-switching-off-clickhouse
11. StarRocks Connector for Tableau is Now Officially Verified | CelerData Blog | 2025-04 | https://celerdata.com/blog/starrocks-connector-for-tableau-is-now-officially-verified
12. CelerData Joins the Connect With Confluent Partner Program | CelerData Blog | 2025-03 | https://celerdata.com/blog/celerdata-joins-the-connect-with-confluent-partner-program
13. CelerData Quarterly Update: Automatic Materialized Views and More | CelerData Blog | 2025-02 | https://celerdata.com/blog/celerdata-quarterly-update-automatic-materialized-views-and-more
14. Announcing GA of AWS Graviton Support on CelerData Cloud BYOC | CelerData Blog | 2025-01 | https://celerdata.com/blog/announcing-ga-of-aws-graviton-support-on-celerdata-cloud-byoc
15. Verisoul Enables Real-Time Analytics by Transitioning off BigQuery | CelerData Blog | 2024-12 | https://celerdata.com/blog/verisoul-enables-real-time-analytics-by-transitioning-off-bigquery
16. 5 Brilliant Lakehouse Architectures from Tencent, WeChat, and More | CelerData Blog | 2024-11 | https://celerdata.com/blog/5-brilliant-lakehouse-architectures-from-tencent-wechat-and-more
17. 3 Data Lakehouse Predictions for 2024 | CelerData Blog | 2024-10 | https://celerdata.com/blog/3-data-lakehouse-predictions-for-2024
18. How to Seamlessly Accelerate Data Lake Queries | CelerData Blog | 2024-09 | https://celerdata.com/blog/how-to-seamlessly-accelerate-data-lake-queries
19. Trino vs. StarRocks: Get Data Warehouse Performance on the Data Lake | CelerData Blog | 2024-08 | https://celerdata.com/blog/trino-vs-starrocks-how-to-get-data-warehouse-performance-on-the-data-lakehouse
20. Why Apache Druid Can't Handle Modern Real-Time Analytics | CelerData Blog | 2024-07 | https://celerdata.com/blog/why-apache-druid-cant-handle-modern-real-time-analytics
21. CelerData X DBTA: Go Pipeline-Free With Real-Time Analytics | CelerData Blog | 2024-06 | https://celerdata.com/blog/celerdata-x-dbta-go-pipeline-free-with-real-time-analytics
22. Ditch Denormalization in Real-Time Analytics With JOINs | CelerData Blog | 2024-05 | https://celerdata.com/blog/ditch-denormalization-in-real-time-analytics-with-joins
23. Denormalizing Tables To Avoid JOINs: Pros, Cons, and Alternatives | CelerData Blog | 2024-04 | https://celerdata.com/blog/denormalizing-tables-to-avoid-joins-pros-cons-and-alternatives
24. Answering Questions About StarRocks vs. ClickHouse | CelerData Blog | 2024-03 | https://celerdata.com/blog/answering-questions-about-starrocks-vs.-clickhouse
25. From Denormalization to Joins: Why ClickHouse Cannot Keep Up | CelerData Blog | 2024-02 | https://celerdata.com/blog/from-denormalization-to-joins-why-clickhouse-cannot-keep-up
26. What Is User Behavior Analytics? | CelerData Blog | 2024-01 | https://celerdata.com/blog/what-is-user-behavior-analytics
27. What Is Real-Time Analytics? | CelerData Blog | 2023-12 | https://celerdata.com/blog/what-is-real-time-analytics
28. Why Achieving Real-Time User-Facing Analytics Is Hard | CelerData Blog | 2023-11 | https://celerdata.com/blog/why-achieving-real-time-user-facing-analytics-is-hard
29. How Expensive is Real-Time Analytics? | CelerData Blog | 2023-10 | https://celerdata.com/blog/how-expensive-is-real-time-analytics
30. How Real-Time Analytics Works: A Step-by-Step Breakdown | CelerData Blog | 2023-09 | https://celerdata.com/blog/how-real-time-analytics-works-a-step-by-step-breakdown
31. What Is User-Facing Analytics? | CelerData Blog | 2023-08 | https://celerdata.com/blog/what-is-user-facing-analytics
32. Is JOIN a Luxury in Real-Time Analytics? | CelerData Blog | 2023-07 | https://celerdata.com/blog/is-join-a-luxury-in-real-time-analytics
33. How To Simplify Your Real-Time Analytics Pipeline | CelerData Blog | 2023-06 | https://celerdata.com/blog/how-to-simplify-your-real-time-analytics-pipeline
34. Is Real-Time Analytics Worth the Real-Time Cost? | CelerData Blog | 2023-05 | https://celerdata.com/blog/is-real-time-analytics-worth-the-real-time-cost
35. Real-Time Analytics: Is It Really for Everyone? | CelerData Blog | 2023-04 | https://celerdata.com/blog/real-time-analytics-is-it-really-for-everyone
36. Debunking The Biggest Myths About Real-Time Analytics | CelerData Blog | 2023-03 | https://celerdata.com/blog/debunking-the-biggest-myths-about-real-time-analytics
37. StarRocks: A Game-Changer in Real-Time Analytics | CelerData Blog | 2023-02 | https://celerdata.com/blog/starrocks-a-game-changer-in-real-time-analytics
38. Real-Time Analytics for the Modern Enterprise | CelerData Blog | 2023-01 | https://celerdata.com/blog/real-time-analytics-for-the-modern-enterprise
39. Delivering Faster Analytics at Pinterest | StarRocks Blog | 2026-01 | https://www.starrocks.io/blog/delivering-faster-analytics-at-pinterest
40. How DiDi Transformed Real-Time Risk Engineering with StarRocks | StarRocks Blog | 2025-12 | https://www.starrocks.io/blog/how-didi-transformed-real-time-risk-engineering-with-starrocks
41. Customer-Facing Analytics Meets Agents: Eightfold's Move from Redshift to StarRocks | StarRocks Blog | 2025-11 | https://www.starrocks.io/blog/customer-facing-analytics-meets-agents-eightfolds-move-from-redshift-to-starrocks
42. Analytical Agents -- New Challenges for the Underlying Data Infrastructure | StarRocks Blog | 2025-10 | https://www.starrocks.io/blog/analytical-agents-new-challenges-for-the-underlying-data-infrastructure
43. 3.5 Webinar Q&A Recap: StarRocks Security, Iceberg Support, and More | StarRocks Blog | 2025-09 | https://www.starrocks.io/blog/35-webinar-qa-recap-starrocks-security-iceberg-support-and-more
44. Introducing StarRocks 3.5 | StarRocks Blog | 2025-08 | https://www.starrocks.io/blog/introducing-starrocks-3-5
45. Introducing StarRocks 3.4 | StarRocks Blog | 2025-07 | https://www.starrocks.io/blog/introducing-starrocks-3.4
46. Accelerate Customer-Facing Analytics on Open Lakehouses With Caching | StarRocks Blog | 2025-06 | https://www.starrocks.io/blog/accelerate-customer-facing-analytics-on-open-lakehouses-with-caching
47. Build a More Open Lakehouse With Unity Catalog | StarRocks Blog | 2025-05 | https://www.starrocks.io/blog/build-a-more-open-lakehouse-with-unity-catalog
48. How to Accelerate Iceberg Metadata Retrieval | StarRocks Blog | 2025-04 | https://www.starrocks.io/blog/how-to-accelerate-iceberg-metadata-retrieval
49. The Answer to the Data Upsert Challenge in Real-Time Analytics | StarRocks Blog | 2025-03 | https://www.starrocks.io/blog/the-answer-to-the-data-upsert-challenge-in-real-time-analytics
50. How To Accelerate Semi-Structured Data Analytics | StarRocks Blog | 2025-02 | https://www.starrocks.io/blog/how-to-accelerate-semi-structured-data-analytics
51. StarRocks 3.3 Is Out: Features and Improvements | StarRocks Blog | 2025-01 | https://www.starrocks.io/blog/starrocks-3.3-is-out-features-and-improvements
52. A Top Social App Boosts Query Speeds on Its Exabyte-Scale Data Lake | StarRocks Blog | 2024-11 | https://www.starrocks.io/blog/a-top-social-app-boosts-query-speeds-on-its-exabyte-scale-data-lake
53. How WeChat's Lakehouse Design Efficiently Handles Trillions of Records | StarRocks Blog | 2024-09 | https://www.starrocks.io/blog/how-wechats-data-lakehouse-architecture-enhances-efficiency-for-trillions-of-daily-records
54. Tencent's A/B Test Platform Unifies All SQL Workloads On The Lakehouse | StarRocks Blog | 2024-07 | https://www.starrocks.io/blog/tencents-abetterchoice-platform-unifies-all-sql-workloads-on-the-data-lakehouse
55. Trip.com Ditches Their Data Warehouse With StarRocks | StarRocks Blog | 2024-05 | https://www.starrocks.io/blog/trip.com-ditches-their-data-warehouse-with-starrocks
56. Tencent Unifies Their Gaming Analytics With StarRocks | StarRocks Blog | 2024-03 | https://www.starrocks.io/blog/tencent-unifies-their-gaming-analytics-with-starrocks
57. High-Concurrency OLAP Workloads with StarRocks Query Cache | StarRocks Blog | 2024-01 | https://www.starrocks.io/blog/starrocks-olap-workloads-with-starrocks-query-cache
58. The Open Data Lakehouse: Towards Democratized Data Analytics | StarRocks Blog | 2023-10 | https://www.starrocks.io/blog/the-open-data-lakehouse-democratized-data-analytics
59. Databricks Iceberg Managed Table Explained | Medium | 2024-09 | https://medium.com/starrocks-engineering/databricks-iceberg-managed-table-explained-8b86551b2703
60. Rockset Is Acquired by OpenAI. What Does It Mean for Its Users? | Medium | 2024-07 | https://medium.com/starrocks-engineering/rockset-is-acquired-by-openai-what-does-it-mean-for-its-users-3fa9561979d2
61. Detailed Comparison Between StarRocks and Apache Doris | Medium | 2024-03 | https://medium.com/starrocks-engineering/detailed-comparison-between-starrocks-and-apache-doris-81ddd34be527
62. Recap of the StarRocks 3.0 Community Call -- Feature Highlights and Q&A | Medium | 2023-06 | https://medium.com/starrocks-engineering/recap-of-the-starrocks-3-0-community-call-feature-highlights-and-q-a-e6f71ea3e7b2
63. Delta Kernel: A Game-Changer for Customer-Facing Analytics | delta.io | 2022-01 | https://delta.io/blog/starrocks-kernel/
64. How to Get Data Warehouse Performance on the Data Lakehouse | The New Stack | 2022-01 | https://thenewstack.io/how-to-get-data-warehouse-performance-on-the-data-lakehouse/
65. What's 'Pipeline-Free' Real-Time Data Analytics? | The New Stack | 2022-01 | https://thenewstack.io/whats-pipeline-free-real-time-data-analytics/
66. Navigating the High-Concurrency Challenges of User-Facing Analytics | The New Stack | 2022-01 | https://thenewstack.io/navigating-the-high-concurrency-challenges-of-user-facing-analytics/
67. How to Go Pipeline-Free with Your Real-Time Analytics | The New Stack | 2022-01 | https://thenewstack.io/how-to-go-pipeline-free-with-your-real-time-analytics/
68. CelerData Upends Real-Time Data Analytics with Dynamic Table Joins | The New Stack | 2022-01 | https://thenewstack.io/celerdata-upends-real-time-data-analytics-with-dynamic-table-joins/
69. The Solution to Data in Motion Is to Just Stop | insideAI News | 2022-01 | http://insideainews.com/2024/04/22/the-solution-to-data-in-motion-is-to-just-stop/
70. Accelerating Apache Superset Dashboards With Materialized Views | Preset.io | 2022-01 | https://preset.io/blog/accelerating-apache-superset-dashboards-with-materialized-views/

VIDEOS (45):
1. Databricks Data+AI Summit 2024 | Conference | 2024-06 | https://www.databricks.com/dataaisummit/speaker/sida-shen
2. StarRocks Summit 2025 -- Announcing StarRocks 4.0 | Conference | 2025-01 | https://summit.starrocks.io/2025
3. StarRocks Year-in-Review 2024 | Conference | 2024-12 | https://x.com/StarRocksLabs/status/1879211873788145773
4. Data Warehouse Performance on the Data Lakehouse | Webinar | 2025-12 | https://www.youtube.com/watch?v=UTRcEqcTx4g
5. How Conductor Builds Sub Second Agentic Analytics at Scale | Webinar | 2025-11 | https://www.youtube.com/watch?v=36pZag6KKcs
6. Apache Iceberg + StarRocks: Your Recipe for Superior Lakehouse Performance | Webinar | 2025-10 | https://www.youtube.com/watch?v=8Q5Vev4O1lQ
7. Customer Facing Analytics: How to Choose a Real Time Cloud Data Warehouse | Webinar | 2025-09 | https://www.youtube.com/watch?v=4OBZc45OoNg
8. From Denormalization to JOINS: Why ClickHouse Can't Keep Up | Webinar | 2025-08 | https://www.youtube.com/watch?v=1xvFZskEp1o
9. What's Next for Lakehouse in 2025 With Databricks and CelerData | Webinar | 2025-07 | https://www.youtube.com/watch?v=KyyVBzjP6A0
10. Why Customer-Facing Analytics Breaks -- and How to Build It Right | Webinar | 2025-06 | https://www.youtube.com/watch?v=6SRBUrW1MOc
11. Introducing StarRocks 3.4 | Webinar | 2025-05 | https://www.youtube.com/watch?v=NHi-0QpMXBA
12. Stream Processing Must Haves | Webinar | 2025-04 | https://www.youtube.com/watch?v=WpHGIPwE1is
13. CelerData Quarterly Update: Automatic Materialized Views and More | Webinar | 2025-03 | https://www.youtube.com/watch?v=r_b8dyKvf1I
14. Zero to Hero: Customer-Facing Analytics on Lakehouse in Under an Hour | Webinar | 2025-02 | https://www.youtube.com/watch?v=mu9ZqDSqJ44
15. Demandbase Ditches Denormalization By Switching off ClickHouse | Webinar | 2025-01 | https://www.youtube.com/watch?v=yqmnboDFyLA
16. StarRocks 3.3 is Here: Key Features and Improvements | Webinar | 2024-12 | https://www.youtube.com/watch?v=8Bpn4wkY9lY
17. Xiaohongshu/RedNote's Secret for Customer-Facing Analytics With 200M+ Users | Webinar | 2024-11 | https://www.youtube.com/watch?v=2cvIZY4EDak
18. CelerData Enables Data Engineers To Build New Analytics Projects Faster (TFiR) | Webinar | 2024-10 | https://www.youtube.com/watch?v=EMsYkabJVpQ
19. Introducing StarRocks 3.5 | Webinar | 2024-09 | https://www.youtube.com/watch?v=K8Ji1uWws8A
20. Engineering Insights from Pinterest: Customer-Facing Analytics that Pays | Webinar | 2024-08 | https://www.youtube.com/watch?v=lK2YeiT8OX4
21. Customer-Facing Analytics Meets Agents: Eightfold's Journey Beyond Redshift | Webinar | 2024-07 | https://www.youtube.com/watch?v=qNk_-QTZk3E
22. 5 Brilliant Lakehouse Architectures from Tencent, WeChat, and More | Webinar | 2024-06 | https://www.youtube.com/watch?v=2Hhrn2jPSRk
23. Query Engine Must-Haves for the Best Apache Superset Experience | Webinar | 2024-05 | https://www.youtube.com/watch?v=rHZTBbZOgWM
24. Bringing Data Warehouse Performance to Apache Iceberg | Webinar | 2024-04 | https://www.youtube.com/watch?v=UoGbJS0CHHw
25. Governed, Fast, and Open: Better Customer-Facing With Unity Catalog | Webinar | 2024-03 | https://www.youtube.com/watch?v=jEmyWWFvBi8
26. Real-Time Analytics for Web3: Fraud Detection, Trading, and Growth at Scale | Webinar | 2024-02 | https://www.youtube.com/watch?v=_MkcCgvYmw8
27. StarRocks: Bridging Lakehouse and OLAP for High-Performance Analytics | Webinar | 2024-01 | https://www.youtube.com/watch?v=_aciC8XCtN4
28. Unity Catalog Community Meetup -- Spice Integration | Webinar | 2023-12 | https://www.youtube.com/watch?v=S2Fsb8BoEPI
29. What Is StarRocks: Features and Use Cases | Webinar | 2023-11 | https://www.youtube.com/watch?v=RfXO5GOnbW4
30. Trino Vs StarRocks -- How to Get Data Warehouse Performance on the Lakehouse | Webinar | 2023-10 | https://www.youtube.com/watch?v=1Ehnmtl60dQ
31. Ditching Denormalization in Real-time Analytics: How StarRocks Delivers Superior JOIN Performance | Webinar | 2023-09 | https://www.youtube.com/watch?v=T1iOZ67jOD8
32. StarRocks Virtual Meetup: Version 3.3.x and What's Next | Webinar | 2023-08 | https://www.youtube.com/watch?v=qs4RQ37h_dI
33. The Register & CelerData: Ditch Your Data Warehouse with Superior Lakehouse Performance | Webinar | 2023-07 | https://www.youtube.com/watch?v=fhalIaRVIdU
34. Rockset Acquired by OpenAI: What's Next for Its Users? | Webinar | 2023-06 | https://www.youtube.com/watch?v=xfnNjsXgYhs
35. StarRocks at Fresha: Carving Streams into Rock | Webinar | 2023-05 | https://www.youtube.com/watch?v=3jis0HzmD2A
36. How to Boost Your Data Lake Performance with Materialized Views | Webinar | 2023-04 | https://www.youtube.com/watch?v=R3F9MPxZDIY
37. What's new with StarRocks 3.0 | Webinar | 2023-03 | https://www.youtube.com/watch?v=SlNoPXBm4EY
38. Why Apache Druid Can't Handle Modern Real-Time Analytics and What to Do About It | Webinar | 2023-02 | https://www.youtube.com/watch?v=wgJaB_PuHO4
39. How to Make User Behavior Analytics Work for You | Webinar | 2023-01 | https://www.youtube.com/watch?v=8ZhWCRObH6M
40. DZone FireSide Chats: How to Go Pipeline Free With Real Time Analytics | Webinar | 2022-12 | https://www.youtube.com/watch?v=ky6swN5VUG4
41. User-facing Analytics (UFA), Challenges, Data Analytics and more! | Webinar | 2022-11 | https://www.youtube.com/watch?v=60QCCqjy1OA
42. CelerData X DBTA -- Go Pipeline-Free With Real-Time Analytics | Webinar | 2022-10 | https://www.youtube.com/watch?v=CVDorXdpS4Q
43. How to Develop User Facing Analytics Projects That Scale | Webinar | 2022-09 | https://www.youtube.com/watch?v=_leXtu5IGEs
44. StarRocks on AWS | Webinar | 2022-08 | https://www.youtube.com/watch?v=TvcXQX0jSGE
45. StarRocks Virtual Office Hours -- What's New and Exciting with StarRocks 2.4.0 | Webinar | 2022-07 | https://www.youtube.com/watch?v=4hWcCQtj9RE

INTERVIEWS (4):
1. Sida Shen of CelerData On How To Leverage Data To Take Your Company To The Next Level | Authority Magazine | https://medium.com/authority-magazine/sida-shen-of-celerdata-on-how-to-leverage-data-to-take-your-company-to-the-next-level-ce5a1c41d960
2. CelerData Enables Data Engineers To Build New Analytics Projects Faster | TFiR | https://tfir.io/celerdata-enables-data-engineers-to-build-new-analytics-projects-faster-sida-shen/
3. CelerData: Breaking the Data Pipeline for Real-Time Analytics | Truth in IT | https://www.truthinit.com/index.php/video/3731/celerdata-breaking-the-data-pipeline-for-real-time-analytics/
4. StarRocks: Bridging Lakehouse and OLAP for High-Performance Analytics | Data Eng Podcast Ep 463 | https://www.dataengineeringpodcast.com/episodepage/starrocks-high-performance-lakehouse-and-olap-episode-463`;


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
    const cwTok = parseInt(res.Item.totalCacheWriteTokens?.N || '0', 10);
    const crTok = parseInt(res.Item.totalCacheReadTokens?.N || '0', 10);
    const cost =
      (inTok / 1_000_000) * INPUT_COST_PER_M +
      (outTok / 1_000_000) * OUTPUT_COST_PER_M +
      (cwTok / 1_000_000) * CACHE_WRITE_COST_PER_M +
      (crTok / 1_000_000) * CACHE_READ_COST_PER_M;
    return cost < cap;
  } catch {
    return true;
  }
}

async function recordUsage(inputTokens, outputTokens, cacheCreationTokens = 0, cacheReadTokens = 0) {
  try {
    await ddb.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { PK: { S: monthKey() } },
      UpdateExpression: 'ADD totalInputTokens :i, totalOutputTokens :o, totalCacheWriteTokens :cw, totalCacheReadTokens :cr',
      ExpressionAttributeValues: {
        ':i': { N: String(inputTokens) },
        ':o': { N: String(outputTokens) },
        ':cw': { N: String(cacheCreationTokens) },
        ':cr': { N: String(cacheReadTokens) },
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
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
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
    let cacheCreationTokens = 0;
    let cacheReadTokens = 0;
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
            cacheCreationTokens = evt.message.usage.cache_creation_input_tokens || 0;
            cacheReadTokens = evt.message.usage.cache_read_input_tokens || 0;
          }
        } catch {
          // skip unparseable
        }
      }
    }

    // Log response (include cache stats)
    console.log(JSON.stringify({
      type: 'response', ip,
      input_tokens: inputTokens, output_tokens: outputTokens,
      cache_creation_tokens: cacheCreationTokens, cache_read_tokens: cacheReadTokens,
      response: fullText,
    }));

    // Record usage — count cache tokens at their actual cost rate
    // Cache write = 1.25x input cost, cache read = 0.1x input cost
    // We track raw tokens but compute cost correctly in checkSpendCap
    if (inputTokens || outputTokens || cacheCreationTokens || cacheReadTokens) {
      await recordUsage(inputTokens, outputTokens, cacheCreationTokens, cacheReadTokens);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: fullText,
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cache_creation_tokens: cacheCreationTokens,
          cache_read_tokens: cacheReadTokens,
        },
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error', detail: err.message }),
    };
  }
}
