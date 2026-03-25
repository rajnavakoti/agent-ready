// Processing state UI module — AgentReady battle test progress

const STEPS = [
  {
    id: 'generate',
    label: 'GENERATING BATTLE SCENARIOS',
    description: 'Analyzing your knowledge base + harness to create targeted stress tests...',
    substeps: [
      'Parsing knowledge base documents...',
      'Analyzing harness coverage (skills, rules, tools)...',
      'Identifying domain-specific attack vectors...',
      'Cross-referencing with real-world datasets...',
      'Generating adversarial edge cases...',
      'Compiling battle scenario set...'
    ]
  },
  {
    id: 'execute',
    label: 'EXECUTING BATTLE TEST',
    description: 'Firing real-world scenarios against your agent configuration...',
    substeps: [
      'Initializing test harness...',
      'Loading domain-specific datasets...',
      'Executing probes in parallel...'
    ]
  },
  {
    id: 'analyze',
    label: 'COMPUTING READINESS SCORE',
    description: 'Analyzing responses, mapping blind spots, scoring readiness...',
    substeps: [
      'Evaluating knowledge depth per category...',
      'Scoring harness coverage gaps...',
      'Detecting edge case vulnerabilities...',
      'Cross-domain resilience analysis...',
      'Computing overall readiness score...',
      'Generating prioritized action plan...'
    ]
  }
];

let substepIntervals = {};

export function renderProcessing(container) {
  container.innerHTML = `
    <div class="processing">
      <h2 class="processing__title text-mono" style="letter-spacing: 2px;">BATTLE TEST IN PROGRESS</h2>
      <div class="processing__steps">
        ${STEPS.map((step, i) => `
          <div class="processing__step" id="step-${step.id}" data-status="pending" style="border: 2px solid var(--color-border); padding: 16px; margin-bottom: 12px;">
            <div class="processing__step-header" style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="processing__step-number text-mono text-accent" style="font-size: var(--font-size-lg); font-weight: bold;">${String(i + 1).padStart(2, '0')}</span>
                <span class="processing__step-label text-mono" style="font-size: var(--font-size-sm);">${step.label}</span>
              </div>
              <span class="processing__step-status text-mono" id="status-${step.id}" style="font-size: var(--font-size-xs);">WAITING</span>
            </div>
            <p class="processing__step-desc text-muted" style="font-size: var(--font-size-xs); margin: 8px 0 0 0;">${step.description}</p>
            <div class="processing__substeps" id="substeps-${step.id}" style="margin-top: 8px; display: none;"></div>
            <div class="processing__step-detail" id="detail-${step.id}" style="margin-top: 8px;"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function updateStep(stepId, status, detail) {
  const stepEl = document.getElementById(`step-${stepId}`);
  const statusEl = document.getElementById(`status-${stepId}`);
  const detailEl = document.getElementById(`detail-${stepId}`);
  const substepsEl = document.getElementById(`substeps-${stepId}`);

  if (!stepEl) return;

  stepEl.dataset.status = status;

  const statusMap = {
    active: '⟳ RUNNING',
    complete: '✓ DONE',
    error: '✗ FAILED',
    pending: '○ WAITING'
  };
  statusEl.textContent = statusMap[status] || status;

  if (status === 'active') {
    stepEl.style.borderColor = 'var(--color-accent)';
    substepsEl.style.display = 'block';
    // Animate substeps
    const step = STEPS.find(s => s.id === stepId);
    if (step) startSubstepAnimation(stepId, step.substeps);
  } else if (status === 'complete') {
    stepEl.style.borderColor = 'var(--color-border)';
    stopSubstepAnimation(stepId);
    // Show all substeps as done
    const step = STEPS.find(s => s.id === stepId);
    if (step && substepsEl) {
      substepsEl.innerHTML = step.substeps.map(s =>
        `<div class="text-mono" style="font-size: 11px; margin: 2px 0; color: var(--color-muted);">  ✓ ${s.replace('...', ' — done')}</div>`
      ).join('');
    }
  } else if (status === 'error') {
    stepEl.style.borderColor = '#8B0000';
    stopSubstepAnimation(stepId);
  }

  if (detail) {
    detailEl.innerHTML = detail;
  }
}

function startSubstepAnimation(stepId, substeps) {
  const substepsEl = document.getElementById(`substeps-${stepId}`);
  if (!substepsEl) return;

  let current = 0;
  substepsEl.innerHTML = '';

  function showNext() {
    if (current < substeps.length) {
      substepsEl.innerHTML += `<div class="text-mono" style="font-size: 11px; margin: 2px 0; color: var(--color-accent);">  ⟳ ${substeps[current]}</div>`;
      current++;
    } else {
      // Loop back with different text
      current = 0;
      substepsEl.innerHTML += `<div class="text-mono" style="font-size: 11px; margin: 2px 0; color: var(--color-muted);">  ↻ Continuing analysis...</div>`;
    }
  }

  showNext(); // show first immediately
  substepIntervals[stepId] = setInterval(showNext, 1500);
}

function stopSubstepAnimation(stepId) {
  if (substepIntervals[stepId]) {
    clearInterval(substepIntervals[stepId]);
    delete substepIntervals[stepId];
  }
}

export function renderProbeProgress(probeIndex, totalProbes, probe) {
  const detailEl = document.getElementById('detail-execute');
  if (!detailEl) return;

  detailEl.innerHTML = `
    <div class="probe-progress text-mono" style="font-size: var(--font-size-xs); padding: 4px 8px; border-left: 2px solid var(--color-accent);">
      <span class="text-accent">[${probeIndex + 1}/${totalProbes}]</span>
      <span>${probe.category}</span>
      <span class="text-muted">— ${probe.question.substring(0, 80)}...</span>
    </div>
  `;
}

export function renderProbeComplete(probeIndex, totalProbes, result) {
  const detailEl = document.getElementById('detail-execute');
  if (!detailEl) return;

  const targetIcon = result.target === 'knowledge' ? '📚' : result.target === 'harness' ? '🔧' : '📚🔧';
  const confidenceColor = result.confidence <= 2 ? '#8B0000' : result.confidence <= 3 ? '#8B7500' : '#006400';

  detailEl.innerHTML += `
    <div class="probe-result text-mono" style="font-size: 11px; margin-top: 4px; padding: 4px 8px; border-left: 2px solid ${confidenceColor};">
      <span class="text-muted">[${probeIndex + 1}/${totalProbes}]</span>
      <span>${targetIcon}</span>
      <span>${result.category}</span>
      <span style="color: ${confidenceColor}; font-weight: bold;">${result.confidence}/5</span>
      <span class="text-muted">— ${result.gaps.length} blind spot${result.gaps.length !== 1 ? 's' : ''}</span>
    </div>
  `;
}
