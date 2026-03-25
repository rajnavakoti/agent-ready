// AgentReady — Battle-test your AI agent's knowledge and harness

import { renderProcessing, updateStep, renderProbeProgress, renderProbeComplete } from './processing.js';
import { renderDashboard } from './dashboard.js';
import { renderBreakdown } from './breakdown.js';
import { renderChecklist } from './checklist.js';

const PRESETS = {
  realestate: {
    knowledge: `We built a real estate evaluation agent. It has access to property listings database, recent sale comparables within 5km radius, neighborhood demographics, school ratings, crime stats, and mortgage rate feeds.

The agent handles: property valuation estimates, market trend analysis, investment ROI calculations, and buyer recommendation reports. It pulls comps from our MLS integration and runs a pricing model trained on 3 years of transaction data.

Known gaps: The agent doesn't understand zoning regulation changes (those are tracked in municipal PDFs that change quarterly). Renovation cost estimates are based on national averages, not local contractor rates. Flood zone and environmental risk data comes from a third-party API that's often 6 months behind.`,
    harness: `System prompt: "You are a real estate evaluation specialist. Always cite comparable sales. Never estimate prices without at least 3 comps. Flag confidence level (high/medium/low) on every valuation."
Tool: MLS search (search by address, radius, property type)
Tool: Mortgage calculator (rate, term, down payment)
Rule: If property is in flood zone, add mandatory risk disclosure paragraph.
Rule: Valuations over $2M require manual review flag.`,
    mission: 'Real estate agent for home evaluation and pricing recommendations'
  },
  support: {
    knowledge: `Customer support bot for a fintech app (mobile banking + crypto trading). Handles: account inquiries, transaction disputes, card replacement requests, crypto transfer issues, and KYC verification status.

The bot has access to: FAQ database (200+ articles), product documentation, fee schedule, and can look up account status via API. It escalates to human agents for: fraud reports, account closures, and complaints.

Known issues: Crypto tax reporting questions are handled inconsistently — regulations differ by country and the bot sometimes gives US-specific answers to EU users. The fee schedule was updated last month but some FAQ articles still reference old pricing.`,
    harness: `System prompt: "You are a friendly, professional support agent for FinApp. Never share account numbers in chat. Always verify identity before account changes. Use simple language, avoid jargon."
Skill: account-lookup (takes user ID, returns account summary)
Skill: create-ticket (escalates to human with context)
Rule: If user mentions fraud, immediately escalate — do not attempt to resolve.
Rule: Crypto questions must include disclaimer: "This is not financial advice."`,
    mission: 'Customer support chatbot for a fintech app handling banking and crypto queries'
  },
  sre: {
    knowledge: `SRE incident management agent for a microservices platform (47 services, Kubernetes on GCP). The agent assists on-call engineers during incidents by: correlating alerts, suggesting runbooks, identifying recent deployments, and drafting incident communications.

It has access to: Grafana dashboards (latency, error rates, throughput), PagerDuty alert history, deployment logs (last 30 days), runbook library (83 runbooks in Confluence), and service dependency map.

Known gaps: The runbook library hasn't been updated in 8 months — 12 services were added since. The service dependency map is manually maintained and missing 3 critical async dependencies via Kafka. Alert correlation rules were written by the previous SRE lead and nobody fully understands the deduplication logic.`,
    harness: `System prompt: "You are an SRE incident assistant. During active incidents: be concise, lead with impact, suggest specific runbooks. Never run destructive commands without human approval."
Tool: grafana-query (query metrics by service name and time range)
Tool: deployment-log (list recent deploys for a service)
Tool: runbook-search (search runbooks by keyword)
Rule: If blast radius > 3 services, auto-escalate to Sev1.
Rule: Always include customer impact estimate in incident comms.`,
    mission: 'SRE agent for production incident management and diagnosis'
  },
  codereview: {
    knowledge: `Code review agent for a TypeScript monorepo (Next.js frontend + Node.js API + shared packages). Reviews PRs for: security vulnerabilities, performance issues, API contract changes, test coverage, and coding standards.

It knows: our ESLint config, TypeScript strict mode rules, API versioning policy (breaking changes need a new version), test coverage threshold (80%), and our component library patterns.

Known gaps: The agent doesn't understand our custom authentication middleware — it was built in-house and the only docs are inline comments. Database migration patterns (we use Prisma) have specific ordering rules that aren't documented. The agent sometimes flags valid patterns from our shared package as issues because it doesn't understand the package's internal API.`,
    harness: `System prompt: "You are a senior code reviewer. Focus on: security, performance, correctness. Be constructive, suggest alternatives, cite specific line numbers."
Tool: file-read (read file at path)
Tool: grep-codebase (search for patterns across repo)
Rule: Always check for SQL injection in any database query.
Rule: Flag any PR that modifies auth middleware for mandatory security review.
Rule: Test files must exist for any new utility function.`,
    mission: 'Automated code review agent for TypeScript monorepo PRs'
  }
};

const DIFFICULTY_LABELS = {
  1: 'QUICK (3 tests)',
  2: 'STANDARD (6 tests)',
  3: 'INTENSE (10 tests)'
};

const MIN_CHARS = 50;

function init() {
  const textarea = document.getElementById('domain-input');
  const missionInput = document.getElementById('mission-input');
  const harnessInput = document.getElementById('harness-input');
  const charCount = document.getElementById('char-count');
  const scanBtn = document.getElementById('scan-btn');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const difficultySlider = document.getElementById('difficulty-slider');
  const difficultyLabel = document.getElementById('difficulty-label');

  function updateScanButton() {
    const knowledgeOk = textarea.value.length >= MIN_CHARS;
    const missionOk = missionInput.value.trim().length > 0;
    scanBtn.disabled = !(knowledgeOk && missionOk);
  }

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} character${len !== 1 ? 's' : ''}`;
    updateScanButton();
  });

  missionInput.addEventListener('input', updateScanButton);

  difficultySlider.addEventListener('input', () => {
    difficultyLabel.textContent = DIFFICULTY_LABELS[difficultySlider.value];
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (PRESETS[preset]) {
        textarea.value = PRESETS[preset].knowledge;
        harnessInput.value = PRESETS[preset].harness || '';
        missionInput.value = PRESETS[preset].mission || '';
        textarea.dispatchEvent(new Event('input'));
        missionInput.dispatchEvent(new Event('input'));
      }
    });
  });

  scanBtn.addEventListener('click', () => {
    const knowledge = textarea.value.trim();
    const harness = harnessInput.value.trim();
    const mission = missionInput.value.trim();
    if (knowledge.length < MIN_CHARS || !mission) return;

    // Combine knowledge + harness + mission into a description for the probe engine
    let description = `AGENT MISSION: ${mission}\n\n`;
    description += `KNOWLEDGE BASE:\n${knowledge}\n\n`;
    if (harness) {
      description += `AGENT HARNESS (skills, rules, tools, system prompts):\n${harness}`;
    }

    startScan(description);
  });
}

async function callFunction(name, body) {
  const response = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.detail || error.error || `${name} failed`);
  }

  return response.json();
}

async function startScan(description) {
  const inputSection = document.getElementById('input-section');
  const processingSection = document.getElementById('processing-section');
  const resultsSection = document.getElementById('results-section');

  inputSection.classList.add('hidden');
  processingSection.classList.remove('hidden');
  resultsSection.classList.add('hidden');

  renderProcessing(processingSection);

  try {
    // Step 1: Generate probes
    updateStep('generate', 'active');
    const { probes } = await callFunction('generate-probes', { description });
    updateStep('generate', 'complete', `<span class="text-mono" style="font-size: var(--font-size-xs);">${probes.length} probes generated</span>`);

    // Step 2: Execute probes
    updateStep('execute', 'active');
    const { results } = await callFunction('execute-probes', { description, probes });

    // Show completion for each probe
    results.forEach((result, i) => {
      renderProbeComplete(i, results.length, result);
    });
    updateStep('execute', 'complete');

    // Step 3: Analyze gaps
    updateStep('analyze', 'active');
    const { analysis } = await callFunction('analyze-gaps', { results });
    updateStep('analyze', 'complete');

    // Render results
    setTimeout(() => {
      processingSection.classList.add('hidden');
      resultsSection.classList.remove('hidden');
      resultsSection.innerHTML = '';

      const dashboardContainer = document.createElement('div');
      const breakdownContainer = document.createElement('div');
      const checklistContainer = document.createElement('div');

      resultsSection.appendChild(dashboardContainer);
      resultsSection.appendChild(breakdownContainer);
      resultsSection.appendChild(checklistContainer);

      renderDashboard(dashboardContainer, analysis);
      renderBreakdown(breakdownContainer, results);
      renderChecklist(checklistContainer, analysis.topGaps);
    }, 800);

  } catch (error) {
    const activeStep = document.querySelector('[data-status="active"]');
    if (activeStep) {
      const stepId = activeStep.id.replace('step-', '');
      updateStep(stepId, 'error', `<span class="text-danger text-mono" style="font-size: var(--font-size-xs);">${error.message}</span>`);
    }

    // Show retry option
    processingSection.innerHTML += `
      <div class="mt-lg">
        <button class="btn btn--secondary" onclick="window.location.reload()">Try again</button>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', init);
