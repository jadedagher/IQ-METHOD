import { loadAgentPrompt, loadWorkflow, loadStep, loadTemplate, listSteps } from './agent-loader';
import type { Locale, Session } from '@/types';

/**
 * Web Adaptation Preamble
 *
 * Injected after the compiled agent system prompt to adapt BMAD workflows
 * for a browser environment without filesystem, git, or codebase access.
 */
function getWebPreamble(locale: Locale): string {
  const lang = locale === 'fr' ? 'French' : 'English';
  return `
## WEB ENVIRONMENT ADAPTATION

You are running in a **web browser** environment. The following constraints apply:

### No Filesystem Access
- You CANNOT read or write files on disk.
- When instructions say "write a file" or "create a file", instead output the complete content wrapped in an artifact marker:
  \`<!-- ARTIFACT: filename.md -->\`
  followed by the full content in a code block.
- When instructions say "read a file", the relevant content has been provided inline below.
- When instructions reference \`{wipFile}\` or any output file, produce it as an artifact.

### No Git Access
- \`{baseline_commit}\` = "NO_GIT"
- Skip all git-related instructions (commit, diff, branch, etc.).

### No Codebase Access
- You do not have access to a project codebase.
- When a workflow step says to "scan code", "search for files", or "investigate the codebase", ask the user to paste relevant code snippets instead.

### Default Configuration
- \`{user_name}\` = "User"
- \`{communication_language}\` = "${lang}"
- \`{document_output_language}\` = "${lang}"
- \`{user_skill_level}\` = "intermediate"
- \`{planning_artifacts}\` = "docs/"
- \`{implementation_artifacts}\` = "docs/"
- \`{date}\` = "${new Date().toISOString().split('T')[0]}"
- \`{project_name}\` = "User's Project"

### Workflow Tracking — MANDATORY

**CRITICAL: You MUST emit markers whenever you transition to a new sub-workflow or step.**

1. **Sub-workflow marker:** When starting a sub-workflow (e.g., the user clicks a menu option like [BP] for Brainstorming), emit:
   \`<!-- WORKFLOW: sub-workflow-name -->\`
   Example: \`<!-- WORKFLOW: brainstorming -->\`

2. **Step marker:** Every time you transition to a new step within a workflow, emit:
   \`<!-- STEP: step-XX-name.md -->\`
   Example: \`<!-- STEP: step-01-session-setup.md -->\`

Place markers on their own line at the **very beginning** of your response.
This is how the UI tracks workflow progress — without these markers, the user sees no progress.

### Simplified Menu
- Skip [A] Advanced Elicitation (not available in web v1)
- Skip [PM] Party Mode (not available in web v1)
- When a checkpoint menu includes these options, only present [C] Continue and chat options.
- The menu commands MH, CH, DA, PM are not needed in web context. Focus on the workflow steps.

### Template Handling
- When the workflow references a template file, it has been provided inline below.
`;
}

/**
 * Build the complete system prompt for a chat turn.
 */
export function buildSystemPrompt(session: Session): string {
  const parts: string[] = [];

  // 1. Compiled agent system prompt (Mary or John)
  parts.push(loadAgentPrompt(session.workflow));

  // 2. Web adaptation preamble (locale-aware)
  parts.push(getWebPreamble(session.locale));

  // 3. Active sub-workflow (only if selected)
  if (session.subWorkflow) {
    const workflow = loadWorkflow(session.workflow, session.subWorkflow);
    if (workflow) {
      parts.push('## ACTIVE WORKFLOW\n\n' + workflow);
    }

    // 3b. Template (if available for this sub-workflow)
    const templateNames = [
      'product-brief.template.md',
      'research.template.md',
      'templates/prd-template.md',
      'template.md',
    ];
    for (const tpl of templateNames) {
      const template = loadTemplate(session.workflow, session.subWorkflow, tpl);
      if (template) {
        parts.push('## TEMPLATE\n\nUse this template when creating the output artifact:\n\n' + template);
        break;
      }
    }
  }

  // 4. Current step content
  if (session.subWorkflow && session.currentStep) {
    const stepContent = loadStep(session.workflow, session.subWorkflow, session.currentStep);
    if (stepContent) {
      parts.push('## CURRENT STEP\n\nYou are currently on this step. Follow its instructions:\n\n' + stepContent);
    }
  }

  // 5. Session state context
  const stateContext = buildStateContext(session);
  parts.push(stateContext);

  return parts.join('\n\n---\n\n');
}

function buildStateContext(session: Session): string {
  const lines = ['## SESSION STATE'];
  lines.push(`- Agent: ${session.workflow === 'analyst' ? 'Mary (Business Analyst)' : 'John (Product Manager)'}`);
  lines.push(`- Workflow: ${session.workflow}`);

  if (session.subWorkflow) {
    const steps = listSteps(session.workflow, session.subWorkflow);
    const currentIdx = steps.indexOf(session.currentStep);
    const nextStep = currentIdx >= 0 && currentIdx < steps.length - 1 ? steps[currentIdx + 1] : null;

    lines.push(`- Sub-workflow: ${session.subWorkflow}`);
    lines.push(`- Current Step: ${session.currentStep} (${currentIdx + 1} of ${steps.length})`);
    lines.push(`- Steps Completed: ${session.stepsCompleted.length > 0 ? session.stepsCompleted.join(', ') : 'none'}`);
    lines.push(`- All steps in order: ${steps.join(', ')}`);

    if (nextStep) {
      lines.push(`\n**REMINDER: When you finish ${session.currentStep}, you MUST output \`<!-- STEP: ${nextStep} -->\` to advance the workflow.**`);
    }
  } else {
    lines.push('- Sub-workflow: none (present your menu to the user)');
    lines.push('- Steps Completed: none');
  }

  lines.push(`- Artifacts Generated: ${session.artifacts.map(a => a.filename).join(', ') || 'none'}`);
  lines.push(`- Tokens Used: ${session.tokenCount}`);

  return lines.join('\n');
}
