import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { AnthropicProvider, generateProbes, executeProbes, analyzeGaps } from '@agent-ready/core';
import { renderTerminal } from '../output/terminal.js';
import { renderJson } from '../output/json.js';
import { renderMarkdown } from '../output/markdown.js';

const SUPPORTED_EXTENSIONS = new Set(['.md', '.txt', '.yaml', '.yml', '.json']);

/**
 * Load all knowledge files from a directory.
 */
async function loadKnowledge(dir) {
  const files = await readdir(dir, { recursive: true });
  const knowledgeFiles = files.filter(f => SUPPORTED_EXTENSIONS.has(extname(f)));

  if (knowledgeFiles.length === 0) {
    throw new Error(`No knowledge files found in ${dir} (supported: ${[...SUPPORTED_EXTENSIONS].join(', ')})`);
  }

  const contents = await Promise.all(
    knowledgeFiles.map(async (f) => {
      const content = await readFile(join(dir, f), 'utf-8');
      return `--- FILE: ${f} ---\n${content}`;
    }),
  );

  return { text: contents.join('\n\n'), fileCount: knowledgeFiles.length };
}

/**
 * Main test command handler.
 */
export async function testCommand(knowledgeDir, options) {
  const startTime = Date.now();

  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(chalk.red('Error: ANTHROPIC_API_KEY environment variable is required'));
    process.exit(2);
  }

  // Load knowledge base
  const loadSpinner = ora('Loading knowledge base...').start();
  let knowledge;
  try {
    knowledge = await loadKnowledge(knowledgeDir);
    loadSpinner.succeed(`Loaded ${knowledge.fileCount} files from ${knowledgeDir}`);
  } catch (err) {
    loadSpinner.fail(err.message);
    process.exit(2);
  }

  // Build description (mission + knowledge + harness)
  const description = `AGENT MISSION: ${options.mission}\n\nKNOWLEDGE BASE:\n${knowledge.text}`;

  // Initialize LLM
  const llm = new AnthropicProvider({ model: options.model });

  // Step 1: Generate probes
  const probeSpinner = ora(`Generating ${options.probes} battle-test probes...`).start();
  let probes;
  try {
    probes = await generateProbes(llm, { description, probeCount: options.probes });
    probeSpinner.succeed(`Generated ${probes.length} probes`);
  } catch (err) {
    probeSpinner.fail(`Probe generation failed: ${err.message}`);
    process.exit(2);
  }

  // Step 2: Execute probes
  const execSpinner = ora('Executing probes against knowledge base...').start();
  let results;
  try {
    results = await executeProbes(llm, { description, probes });
    execSpinner.succeed(`Executed ${results.length} probes`);
  } catch (err) {
    execSpinner.fail(`Probe execution failed: ${err.message}`);
    process.exit(2);
  }

  // Step 3: Analyze gaps
  const analyzeSpinner = ora('Analyzing gaps and scoring readiness...').start();
  let analysis;
  try {
    analysis = await analyzeGaps(llm, { results });
    analyzeSpinner.succeed('Analysis complete');
  } catch (err) {
    analyzeSpinner.fail(`Analysis failed: ${err.message}`);
    process.exit(2);
  }

  // Build report
  const report = {
    readinessScore: analysis.overallScore,
    categories: analysis.categories,
    topGaps: analysis.topGaps,
    interpretation: analysis.interpretation,
    probeResults: results,
    metadata: {
      timestamp: new Date().toISOString(),
      model: options.model,
      probeCount: probes.length,
      knowledgeFiles: knowledge.fileCount,
      mission: options.mission,
      domain: options.domain,
      durationMs: Date.now() - startTime,
    },
  };

  // Render output
  switch (options.output) {
    case 'json':
      renderJson(report);
      break;
    case 'markdown':
      renderMarkdown(report);
      break;
    default:
      renderTerminal(report);
  }

  // Exit code based on threshold
  if (options.threshold && report.readinessScore < options.threshold) {
    console.log(chalk.red(`\n✗ FAIL: Readiness ${report.readinessScore}% is below threshold ${options.threshold}%`));
    process.exit(1);
  } else if (options.threshold) {
    console.log(chalk.green(`\n✓ PASS: Readiness ${report.readinessScore}% meets threshold ${options.threshold}%`));
  }
}
