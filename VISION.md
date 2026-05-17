# AgentReady — Vision & Roadmap

## The Problem

Everyone is shipping AI agents. Nobody knows if they're ready.

Teams build agents with knowledge bases, system prompts, tools, and skills. They test manually — "does it answer my question?" — and ship. Then production users ask questions the team never thought of, hit edge cases nobody tested, and the agent hallucinates confidently.

**The testing gap:** LLM providers test their models. Nobody tests what YOU built on top — the knowledge base, the harness, the tool integrations, the domain coverage.

## The Insight

There are 800M+ real-world data points sitting in public datasets — real customer support tickets, real IT incidents with resolutions, real medical questions with correct answers, real legal contracts with expert annotations, real fraud cases with labels. These are GROUND TRUTH.

Instead of asking AI to judge AI ("does this answer look good?"), we ask: **does your agent produce answers that match what actually happened in the real world?**

That's the difference between vibes and data.

## The DDC Connection

AgentReady is DDC (Demand-Driven Context) applied as a product:
- **DDC thesis:** Use agent failure as the signal for what knowledge to curate
- **AgentReady implementation:** Generate probes that expose failures, map failures to specific knowledge/harness gaps, produce a prioritized curation checklist
- **The loop:** Test → Find gaps → Curate → Test again → Measure convergence

## Current State (Hackathon MVP)

- 3-step pipeline: Generate Probes → Execute Probes → Analyze Gaps
- Claude Sonnet generates and evaluates everything
- Netlify Functions (serverless) — **removing this**
- Vanilla JS frontend, neo-brutalist UI
- 5 sample domains with realistic knowledge bases
- No actual dataset integration (800M number is marketing only)
- No auth, no persistence, no CI/CD integration

## Vision: What AgentReady Becomes

### For OSS Users (Free, Self-Hosted)
A CLI + API that you point at your agent's knowledge base and get a readiness report. Runs locally, uses your own API key, integrates into CI/CD.

```bash
# Run battle test locally
agent-ready test ./knowledge-base/ --mission "SRE incident responder" --domain sre

# Output: readiness score, gaps, comparison to real-world incidents
# Exit code 1 if readiness < threshold (for CI/CD gates)
```

### For Commercial Users (Hosted SaaS)
A platform where you connect your agent (GitHub repo, API endpoint, or direct upload), run continuous battle tests, track readiness over time, and benchmark against real-world data.

---

## Architecture (Post-Netlify)

```
agent-ready/
├── packages/
│   ├── core/                  # The engine — probe generation, execution, analysis
│   │   ├── generators/        # Probe generators (per domain + generic)
│   │   ├── executors/         # Probe execution (against knowledge, against live agent)
│   │   ├── analyzers/         # Gap analysis, scoring, ground-truth comparison
│   │   └── datasets/          # Dataset loaders (HuggingFace, local files)
│   │
│   ├── cli/                   # CLI tool — `agent-ready test`
│   │   └── commands/          # test, benchmark, report
│   │
│   └── api/                   # REST API server (Express/Fastify, self-hostable)
│       └── routes/            # /test, /report, /datasets
│
├── datasets/                  # Dataset configs + sample data
│   ├── sre-incidents/         # UCI ServiceNow dataset loader
│   ├── customer-support/      # Twitter support dataset loader
│   ├── healthcare/            # MedQA loader
│   ├── legal/                 # CUAD + ContractNLI loader
│   ├── finance-fraud/         # Credit card fraud loader
│   ├── ecommerce/             # Amazon reviews + support QA
│   ├── code-bugs/             # SWE-bench + Defects4J loader
│   └── real-estate/           # RETQA loader
│
├── web/                       # Frontend (keep neo-brutalist, remove Netlify dep)
│   └── src/
│
└── docs/                      # Documentation
```

### Key Architectural Decisions

1. **Monorepo with packages** — core engine is independent of delivery mechanism (CLI, API, web)
2. **LLM-agnostic core** — support Anthropic, OpenAI, local models. The probe generation and analysis use LLMs, but the ground-truth comparison is deterministic
3. **Dataset as first-class concept** — not just marketing. Datasets are loaded, indexed, and used for probe generation AND scoring
4. **Self-hostable** — no vendor lock-in. Your API key, your infra
5. **CI/CD native** — exit codes, JSON output, threshold-based pass/fail

---

## The Dataset Integration Vision

### Current (MVP): AI Evaluates AI
```
User uploads knowledge → Claude generates probes → Claude answers probes → Claude judges answers
```
Problem: No ground truth. Claude judges itself. Circular.

### Target: Real Data Evaluates AI
```
User selects domain → Load real-world dataset → Pick relevant scenarios from dataset →
Run scenarios against user's knowledge → Compare agent's answer to ACTUAL resolution →
Score based on real outcomes, not AI judgment
```

### How It Works (Example: SRE Domain)

1. User uploads their SRE knowledge base (runbooks, architecture docs, alert configs)
2. System loads UCI ServiceNow dataset (24,918 real incidents with resolutions)
3. System selects 20 incidents that SHOULD be answerable from the user's knowledge base (keyword matching on services, technologies, incident types)
4. For each incident: "Given this incident description, what's the resolution?"
5. Compare agent's answer to the ACTUAL resolution from the dataset
6. Score: Did the agent identify the right root cause? The right resolution steps? The right escalation path?
7. Gaps: "Your knowledge base has no information about {specific scenario that appears in real-world data but not in your docs}"

### Ground Truth Scoring

Instead of Claude rating confidence 1-5, we compare to real outcomes:

| Metric | What It Measures |
|--------|-----------------|
| **Coverage** | What % of real-world scenarios does the knowledge base address? |
| **Accuracy** | When the agent answers, does it match the real resolution? |
| **Completeness** | Does the agent's answer include all steps from the real resolution? |
| **Hallucination Rate** | How often does the agent invent steps not in the real resolution? |
| **Gap Specificity** | Can we name EXACTLY what's missing (not "more context needed" but "missing runbook for Redis failover")? |

---

## OSS Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Working CLI that replaces the Netlify functions

- [ ] Remove Netlify dependency — move to standalone Node.js
- [ ] Create `@agent-ready/core` package with the 3-step pipeline
- [ ] Create `@agent-ready/cli` — `agent-ready test <knowledge-dir> --mission "..."`
- [ ] JSON output format for CI/CD integration
- [ ] Exit code based on readiness threshold
- [ ] Keep existing probe generation logic (AI-based) — dataset integration comes later

### Phase 2: First Dataset Integration (Weeks 3-4)
**Goal:** One domain grounded in real data

- [ ] Pick ONE dataset: UCI ServiceNow (SRE incidents) — best quality, CC BY 4.0, immediately usable
- [ ] Build dataset loader (download, parse, index)
- [ ] Build scenario selector (match incidents to user's knowledge domain)
- [ ] Build ground-truth comparator (agent answer vs real resolution)
- [ ] New scoring: coverage + accuracy + completeness (not just confidence)
- [ ] CLI flag: `--domain sre --ground-truth`

### Phase 3: Multi-Domain Datasets (Weeks 5-8)
**Goal:** All 8 domains with real data

- [ ] Customer Support (Twitter dataset, CC0)
- [ ] Healthcare (MedQA, MIT)
- [ ] Legal (CUAD + ContractNLI, CC BY 4.0)
- [ ] Finance/Fraud (Credit Card Fraud, ODbL)
- [ ] E-Commerce (rjac support QA)
- [ ] Code/Bugs (SWE-bench, MIT)
- [ ] Real Estate (RETQA)
- [ ] Custom domain support (bring your own dataset)

### Phase 4: CI/CD & API (Weeks 9-10)
**Goal:** Production-ready for teams

- [ ] REST API server (self-hostable)
- [ ] GitHub Action: `agent-ready/test-action@v1`
- [ ] Pre-commit hook support
- [ ] Threshold configuration (fail build if readiness < 70%)
- [ ] Report generation (Markdown, HTML, JSON)
- [ ] History tracking (readiness score over time, stored locally)

### Phase 5: Web UI Refresh (Weeks 11-12)
**Goal:** Self-hostable web dashboard

- [ ] Remove all Netlify-specific code
- [ ] Static frontend + API backend (docker-compose for self-hosting)
- [ ] Keep neo-brutalist design
- [ ] Dashboard: readiness trends, gap history, domain coverage
- [ ] Dataset browser: explore what's in the datasets

---

## Commercial Product Vision (Future — If Traction Warrants)

### What Free/OSS Gets You
- CLI + API, self-hosted
- All 8 datasets
- Ground-truth scoring
- CI/CD integration
- Unlimited local runs

### What Paid Gets You (SaaS)
- **Hosted platform** — no infrastructure to manage
- **Team collaboration** — shared benchmarks, team-level readiness tracking
- **Custom datasets** — upload your own ground-truth data (internal incidents, support tickets)
- **Agent connectivity** — test against a live agent API endpoint (not just knowledge base)
- **Continuous monitoring** — scheduled tests, alerts when readiness drops
- **Benchmark marketplace** — compare your agent's readiness against anonymized industry benchmarks
- **Audit trail** — compliance-friendly reports for regulated industries

### Pricing Thinking (Not Final)
| Tier | Price | What |
|------|-------|------|
| Free (OSS) | $0 | CLI, all datasets, unlimited local runs |
| Pro | $49/mo | Hosted dashboard, history, team features, 100 tests/month |
| Enterprise | Custom | Custom datasets, live agent testing, SSO, audit trail |

---

## Why This Works as a Product

1. **Real differentiation:** Nobody else tests the knowledge/harness layer with ground-truth data
2. **Natural virality:** "What's your agent's readiness score?" becomes a team conversation
3. **CI/CD lock-in:** Once you gate deploys on readiness score, you can't remove it
4. **Data moat:** The dataset curation + domain-specific probe templates improve with usage
5. **DDC connection:** Every gap found is a DDC entity that needs curation — feeds back into the research
6. **Timing:** AI agents are shipping NOW, eval tooling is immature, the window is open

## Competitive Landscape

| Tool | What It Does | How AgentReady Differs |
|------|-------------|----------------------|
| LangSmith | Tracing + eval for LangChain apps | Tests the chain, not the knowledge. No ground truth |
| Braintrust | LLM eval platform | Model eval, not knowledge eval. AI judges AI |
| Promptfoo | Prompt testing | Tests prompts, not harness coverage. No domain datasets |
| Ragas | RAG evaluation | RAG-specific. Measures retrieval, not domain completeness |
| DeepEval | LLM testing framework | Generic metrics. No real-world dataset grounding |
| **AgentReady** | Knowledge + harness battle-testing | **Tests what YOU built, scored against real-world outcomes** |

## One-Line Pitch

"Your agent is only as good as what it knows. We test that — with real data, not vibes."

---

## Tech Stack (Post-Netlify)

- **Runtime:** Node.js (keep JS ecosystem for frontend compatibility)
- **LLM SDK:** Anthropic + OpenAI (provider-agnostic)
- **CLI:** Commander.js or yargs
- **API:** Fastify (lightweight, fast)
- **Frontend:** Vanilla JS (keep current) or migrate to Astro (static + islands)
- **Datasets:** HuggingFace `datasets` via Python script → JSON cache, or direct CSV parsing in Node
- **Testing:** Vitest
- **Packaging:** npm monorepo (pnpm workspaces)
- **Docker:** docker-compose for self-hosting (API + frontend)
