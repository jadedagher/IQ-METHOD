import fs from 'node:fs';
import path from 'node:path';
import type { WorkflowType } from '@/types';

const COMPILED_DIR = path.join(process.cwd(), 'compiled');

const agentPromptCache = new Map<string, string>();
const workflowCache = new Map<string, string>();
const stepCache = new Map<string, string>();

export function loadAgentPrompt(workflow: WorkflowType): string {
  const cached = agentPromptCache.get(workflow);
  if (cached) return cached;

  const filename = workflow === 'analyst' ? 'analyst.md' : 'pm.md';
  const filePath = path.join(COMPILED_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  agentPromptCache.set(workflow, content);
  return content;
}

export function loadWorkflow(workflow: WorkflowType, subWorkflow: string): string {
  const key = `${workflow}/${subWorkflow}`;
  const cached = workflowCache.get(key);
  if (cached) return cached;

  const filePath = path.join(COMPILED_DIR, 'workflows', workflow, subWorkflow, 'workflow.md');
  if (!fs.existsSync(filePath)) return '';
  const content = fs.readFileSync(filePath, 'utf8');
  workflowCache.set(key, content);
  return content;
}

export function loadStep(workflow: WorkflowType, subWorkflow: string, stepFile: string): string {
  const key = `${workflow}/${subWorkflow}/${stepFile}`;
  const cached = stepCache.get(key);
  if (cached) return cached;

  const filePath = path.join(COMPILED_DIR, 'workflows', workflow, subWorkflow, 'steps', stepFile);
  if (!fs.existsSync(filePath)) return '';
  const content = fs.readFileSync(filePath, 'utf8');
  stepCache.set(key, content);
  return content;
}

export function loadTemplate(workflow: WorkflowType, subWorkflow: string, templateFile: string): string {
  const filePath = path.join(COMPILED_DIR, 'workflows', workflow, subWorkflow, templateFile);
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

export function listSteps(workflow: WorkflowType, subWorkflow: string): string[] {
  const stepsDir = path.join(COMPILED_DIR, 'workflows', workflow, subWorkflow, 'steps');
  if (!fs.existsSync(stepsDir)) return [];
  return fs.readdirSync(stepsDir)
    .filter(f => f.endsWith('.md'))
    .sort();
}
