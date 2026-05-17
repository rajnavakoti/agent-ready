import { writeFileSync } from 'node:fs';

/**
 * Render the report as JSON (write to file + stdout).
 */
export function renderJson(report) {
  const json = JSON.stringify(report, null, 2);
  writeFileSync('agent-ready-report.json', json);
  console.log(json);
}
