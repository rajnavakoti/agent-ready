/**
 * Render the report as Markdown.
 */
export function renderMarkdown(report) {
  const { readinessScore, categories, topGaps, interpretation, probeResults, metadata } = report;

  const lines = [];
  lines.push(`# Agent Readiness Report`);
  lines.push('');
  lines.push(`**Score:** ${readinessScore}%`);
  lines.push(`**Mission:** ${metadata.mission}`);
  lines.push(`**Date:** ${metadata.timestamp}`);
  lines.push(`**Model:** ${metadata.model} | **Probes:** ${metadata.probeCount} | **Files:** ${metadata.knowledgeFiles}`);
  lines.push('');

  // Categories
  lines.push('## Category Scores');
  lines.push('');
  lines.push('| Category | Score |');
  lines.push('|----------|-------|');
  if (categories) {
    for (const [key, value] of Object.entries(categories)) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      lines.push(`| ${label} | ${value}% |`);
    }
  }
  lines.push('');

  // Top gaps
  if (topGaps && topGaps.length > 0) {
    lines.push('## Top Gaps');
    lines.push('');
    lines.push('| # | Severity | Gap | Target | Fix |');
    lines.push('|---|----------|-----|--------|-----|');
    topGaps.forEach((gap, i) => {
      lines.push(`| ${i + 1} | ${gap.severity} | ${gap.what} | ${gap.target} | ${gap.fix} |`);
    });
    lines.push('');
  }

  // Interpretation
  if (interpretation) {
    lines.push('## Assessment');
    lines.push('');
    lines.push(interpretation);
    lines.push('');
  }

  // Probe results
  if (probeResults && probeResults.length > 0) {
    lines.push('## Probe Results');
    lines.push('');
    probeResults.forEach((r, i) => {
      lines.push(`### Probe ${i + 1}: ${r.question}`);
      lines.push(`- **Category:** ${r.category} | **Confidence:** ${r.confidence}/5 | **Target:** ${r.target}`);
      lines.push(`- **Answer:** ${r.attempt}`);
      if (r.gaps.length > 0) {
        lines.push(`- **Gaps:** ${r.gaps.join('; ')}`);
      }
      lines.push('');
    });
  }

  console.log(lines.join('\n'));
}
