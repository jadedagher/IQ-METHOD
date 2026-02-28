/**
 * Detect step transitions in assistant messages.
 * Steps are marked with: <!-- STEP: step-name.md -->
 */
export function detectStepTransition(text: string): string | null {
  const match = text.match(/<!--\s*STEP:\s*([^\s>]+)\s*-->/);
  return match ? match[1] : null;
}

/**
 * Detect sub-workflow transitions in assistant messages.
 * Sub-workflows are marked with: <!-- WORKFLOW: workflow-name -->
 */
export function detectWorkflowTransition(text: string): string | null {
  const match = text.match(/<!--\s*WORKFLOW:\s*([^\s>]+)\s*-->/);
  return match ? match[1] : null;
}

/**
 * Extract all step transitions from a message (there could be multiple).
 */
export function detectAllStepTransitions(text: string): string[] {
  const regex = /<!--\s*STEP:\s*([^\s>]+)\s*-->/g;
  const steps: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    steps.push(match[1]);
  }
  return steps;
}

/**
 * Strip step and workflow markers from displayed text.
 */
export function stripStepMarkers(text: string): string {
  return text
    .replace(/<!--\s*STEP:\s*[^\s>]+\s*-->/g, '')
    .replace(/<!--\s*WORKFLOW:\s*[^\s>]+\s*-->/g, '');
}
