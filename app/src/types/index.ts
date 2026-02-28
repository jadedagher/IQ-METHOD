export type WorkflowType = 'analyst' | 'pm';
export type Locale = 'en' | 'fr';

export interface Session {
  id: string;
  workflow: WorkflowType;
  locale: Locale;
  messages: ChatMessage[];
  currentStep: string;
  stepsCompleted: string[];
  artifacts: Artifact[];
  tokenCount: number;
  createdAt: number;
  lastActiveAt: number;
  subWorkflow?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Artifact {
  filename: string;
  content: string;
  extractedAt: number;
}

export interface StepInfo {
  id: string;
  name: string;
  description: string;
}

export const SUB_WORKFLOW_STEPS: Record<string, StepInfo[]> = {
  'brainstorming': [
    { id: 'step-01-session-setup', name: 'Setup', description: 'Session setup' },
    { id: 'step-02', name: 'Techniques', description: 'Technique selection' },
    { id: 'step-03-technique-execution', name: 'Ideation', description: 'Generate ideas' },
    { id: 'step-04-idea-organization', name: 'Synthesis', description: 'Organize ideas' },
  ],
  'create-brief': [
    { id: 'step-01-init', name: 'Init', description: 'Setup workspace' },
    { id: 'step-02-vision', name: 'Vision', description: 'Product vision' },
    { id: 'step-03-users', name: 'Users', description: 'User analysis' },
    { id: 'step-04-metrics', name: 'Metrics', description: 'Success metrics' },
    { id: 'step-05-scope', name: 'Scope', description: 'Define scope' },
    { id: 'step-06-complete', name: 'Complete', description: 'Finalize brief' },
  ],
  'create-prd': [
    { id: 'step-01-init', name: 'Init', description: 'Setup PRD' },
    { id: 'step-02-discovery', name: 'Discovery', description: 'Project classification' },
    { id: 'step-02b-vision', name: 'Vision', description: 'Product vision' },
    { id: 'step-02c-executive-summary', name: 'Summary', description: 'Executive summary' },
    { id: 'step-03-success', name: 'Metrics', description: 'Success metrics' },
    { id: 'step-04-journeys', name: 'Journeys', description: 'User journeys' },
    { id: 'step-05-domain', name: 'Domain', description: 'Domain model' },
    { id: 'step-06-innovation', name: 'Innovation', description: 'Innovation analysis' },
    { id: 'step-07-project-type', name: 'Type', description: 'Project type' },
    { id: 'step-08-scoping', name: 'Scoping', description: 'Scope definition' },
    { id: 'step-09-functional', name: 'Functional', description: 'Functional requirements' },
    { id: 'step-10-nonfunctional', name: 'Non-Functional', description: 'Non-functional requirements' },
    { id: 'step-11-polish', name: 'Polish', description: 'Document polish' },
    { id: 'step-12-complete', name: 'Complete', description: 'Finalize PRD' },
  ],
  'domain-research': [
    { id: 'step-01-init', name: 'Init', description: 'Setup research' },
    { id: 'step-02-domain-analysis', name: 'Domain', description: 'Domain analysis' },
    { id: 'step-03-competitive-landscape', name: 'Competitive', description: 'Competitive landscape' },
    { id: 'step-04-regulatory-focus', name: 'Regulatory', description: 'Regulatory focus' },
    { id: 'step-05-technical-trends', name: 'Trends', description: 'Technical trends' },
    { id: 'step-06-research-synthesis', name: 'Synthesis', description: 'Research synthesis' },
  ],
  'market-research': [
    { id: 'step-01-init', name: 'Init', description: 'Setup research' },
    { id: 'step-02-customer-behavior', name: 'Behavior', description: 'Customer behavior' },
    { id: 'step-03-customer-pain-points', name: 'Pain Points', description: 'Customer pain points' },
    { id: 'step-04-customer-decisions', name: 'Decisions', description: 'Customer decisions' },
    { id: 'step-05-competitive-analysis', name: 'Competitive', description: 'Competitive analysis' },
    { id: 'step-06-research-completion', name: 'Complete', description: 'Research completion' },
  ],
  'technical-research': [
    { id: 'step-01-init', name: 'Init', description: 'Setup research' },
    { id: 'step-02-technical-overview', name: 'Overview', description: 'Technical overview' },
    { id: 'step-03-integration-patterns', name: 'Integration', description: 'Integration patterns' },
    { id: 'step-04-architectural-patterns', name: 'Architecture', description: 'Architectural patterns' },
    { id: 'step-05-implementation-research', name: 'Implementation', description: 'Implementation research' },
    { id: 'step-06-research-synthesis', name: 'Synthesis', description: 'Research synthesis' },
  ],
};

export interface StreamChunk {
  type: 'text' | 'artifact' | 'step' | 'workflow' | 'error' | 'done' | 'usage';
  content?: string;
  artifact?: Artifact;
  step?: string;
  workflow?: string;
  error?: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface SessionCreateResponse {
  sessionId: string;
  workflow: WorkflowType;
}

export interface ChatRequestBody {
  sessionId: string;
  message: string;
}
