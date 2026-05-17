import chalk from 'chalk';

/**
 * Render the readiness report to terminal with colors.
 */
export function renderTerminal(report) {
  const { readinessScore, categories, topGaps, interpretation, metadata } = report;

  console.log('\n' + chalk.bold('═══ AGENT READINESS REPORT ═══\n'));

  // Score badge
  const scoreColor = readinessScore >= 75 ? chalk.green : readinessScore >= 50 ? chalk.yellow : chalk.red;
  console.log(`  Readiness Score: ${scoreColor.bold(`${readinessScore}%`)}\n`);

  // Category scores
  console.log(chalk.dim('  Category Scores:'));
  if (categories) {
    for (const [key, value] of Object.entries(categories)) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const bar = '█'.repeat(Math.round(value / 5)) + '░'.repeat(20 - Math.round(value / 5));
      const color = value >= 70 ? chalk.green : value >= 40 ? chalk.yellow : chalk.red;
      console.log(`    ${label.padEnd(22)} ${color(bar)} ${value}%`);
    }
  }

  // Top gaps
  if (topGaps && topGaps.length > 0) {
    console.log(chalk.bold('\n  Top Gaps:\n'));
    topGaps.slice(0, 5).forEach((gap, i) => {
      const sevColor = gap.severity === 'critical' ? chalk.red : gap.severity === 'high' ? chalk.yellow : chalk.dim;
      console.log(`    ${i + 1}. ${sevColor(`[${gap.severity.toUpperCase()}]`)} ${gap.what}`);
      console.log(`       Target: ${gap.target} | ${chalk.dim(gap.impact)}`);
      console.log(`       Fix: ${chalk.cyan(gap.fix)}`);
    });
  }

  // Interpretation
  if (interpretation) {
    console.log(chalk.bold('\n  Assessment:\n'));
    console.log(`    ${chalk.italic(interpretation)}`);
  }

  // Metadata
  console.log(chalk.dim(`\n  ─── ${metadata.probeCount} probes | ${metadata.knowledgeFiles} files | ${metadata.model} | ${(metadata.durationMs / 1000).toFixed(1)}s ───\n`));
}
