#!/usr/bin/env node

import { Command } from 'commander';
import { testCommand } from './commands/test.js';

const program = new Command();

program
  .name('agent-ready')
  .description('Battle-test your AI agent\'s knowledge base. Ship with data, not vibes.')
  .version('0.1.0');

program
  .command('test')
  .description('Run battle-test probes against your agent\'s knowledge base')
  .argument('<knowledge-dir>', 'Directory containing knowledge base files (.md, .txt, .yaml)')
  .requiredOption('--mission <mission>', 'One-line description of what your agent does')
  .option('--domain <domain>', 'Domain for dataset-grounded testing (sre, medical, legal, custom)', 'custom')
  .option('--threshold <number>', 'Minimum readiness score (exit code 1 if below)', parseInt)
  .option('--probes <number>', 'Number of probes to generate', parseInt, 6)
  .option('--model <model>', 'LLM model to use', 'claude-sonnet-4-20250514')
  .option('--output <format>', 'Output format: terminal, json, markdown', 'terminal')
  .option('--ground-truth', 'Use dataset ground-truth scoring (requires --domain)', false)
  .action(testCommand);

program.parse();
