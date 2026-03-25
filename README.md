# AgentReady

"Battle-test your AI agent's knowledge before you ship. Ship with data, not vibes."

AgentReady is a lightweight, Netlify-deployed harness that stress-tests the **knowledge base** and **agent harness** (skills/rules/tools/system prompts) you built around an LLM.

## What it does

1. Upload your agent's **knowledge base** (docs, runbooks, READMEs, etc.)
2. Upload your agent **harness** (optional) + describe the agent's **mission**
3. Get a **readiness score** and a prioritized list of **blind spots** before users find them

## How it works

1. **Generates stress-test probes** tailored to your mission and domain (incidents, edge cases, adversarial prompts, cross-domain questions)
2. **Evaluates knowledge + harness coverage** by running probes and forcing the model to be explicit about confidence + missing context
3. **Returns a readiness score + top gaps** (what's missing, whether it's a knowledge vs harness issue, why it matters, and how to fix it)

## Tech stack

- Netlify Functions (serverless)
- Anthropic Claude API (`@anthropic-ai/sdk`)
- Vanilla JS (no framework)
- Neo-brutalist CSS

## Setup

### Local dev

```bash
git clone https://github.com/rajnavakoti/agent-ready
cd agent-ready
npm install

# Run Netlify dev server (functions + static site)
ANTHROPIC_API_KEY=your-key npm run dev
```

Then open the local URL printed by Netlify (defaults to `http://localhost:8888`).

### Deploy to Netlify

1. Create a new Netlify site from this repo
2. Set the environment variable `ANTHROPIC_API_KEY`
3. Deploy

`netlify.toml` already sets:

- `publish = "src"`
- `functions = "netlify/functions"`

## Architecture

The app is a 3-function pipeline:

- `netlify/functions/generate-probes.mjs`: given mission + knowledge base + harness, generates targeted probes (JSON)
- `netlify/functions/execute-probes.mjs`: runs each probe against the provided context and returns answers + confidence + explicit gaps
- `netlify/functions/analyze-gaps.mjs`: aggregates results into category scores, an overall readiness score, and the top blind spots

On the frontend, `src/js/app.js` orchestrates the pipeline:

1. `/.netlify/functions/generate-probes`
2. `/.netlify/functions/execute-probes`
3. `/.netlify/functions/analyze-gaps`

## Datasets

AgentReady uses **17+ public datasets across 8 domains** to ground scenario simulation, including:

- Customer support
- IT incidents
- Healthcare
- Legal
- Finance / fraud
- E-commerce
- Real estate
- Code / bugs

## Research

This project is inspired by DDC-style evaluation methodology: https://arxiv.org/abs/2603.14057

## License

MIT (see `LICENSE`).
