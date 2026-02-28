import type { Session, WorkflowType, Locale, ChatMessage, Artifact } from '@/types';

const SESSION_TTL = 2 * 60 * 60 * 1000; // 2 hours
const MAX_TOKENS_PER_SESSION = parseInt(process.env.MAX_TOKENS_PER_SESSION || '100000', 10);

const sessions = new Map<string, Session>();

// Periodic cleanup (every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (now - session.lastActiveAt > SESSION_TTL) {
        sessions.delete(id);
      }
    }
  }, 10 * 60 * 1000);
}

export function createSession(workflow: WorkflowType, locale: Locale = 'fr'): Session {
  const id = crypto.randomUUID();

  const session: Session = {
    id,
    workflow,
    locale,
    messages: [],
    currentStep: '',
    stepsCompleted: [],
    artifacts: [],
    tokenCount: 0,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    subWorkflow: undefined,
  };

  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  // Check TTL
  if (Date.now() - session.lastActiveAt > SESSION_TTL) {
    sessions.delete(id);
    return undefined;
  }

  session.lastActiveAt = Date.now();
  return session;
}

export function addMessage(sessionId: string, message: ChatMessage): void {
  const session = getSession(sessionId);
  if (!session) return;
  session.messages.push(message);
}

export function addArtifact(sessionId: string, artifact: Artifact): void {
  const session = getSession(sessionId);
  if (!session) return;
  // Replace if same filename exists
  const idx = session.artifacts.findIndex(a => a.filename === artifact.filename);
  if (idx >= 0) {
    session.artifacts[idx] = artifact;
  } else {
    session.artifacts.push(artifact);
  }
}

export function updateStep(sessionId: string, step: string): void {
  const session = getSession(sessionId);
  if (!session) return;
  if (session.currentStep && !session.stepsCompleted.includes(session.currentStep)) {
    session.stepsCompleted.push(session.currentStep);
  }
  session.currentStep = step;
}

export function updateSubWorkflow(sessionId: string, subWorkflow: string): void {
  const session = getSession(sessionId);
  if (!session) return;
  session.subWorkflow = subWorkflow;
  session.currentStep = '';
  session.stepsCompleted = [];
}

export function addTokens(sessionId: string, count: number): boolean {
  const session = getSession(sessionId);
  if (!session) return false;
  session.tokenCount += count;
  return session.tokenCount <= MAX_TOKENS_PER_SESSION;
}

export function isOverBudget(sessionId: string): boolean {
  const session = getSession(sessionId);
  if (!session) return true;
  return session.tokenCount > MAX_TOKENS_PER_SESSION;
}

export function getSessionCount(): number {
  return sessions.size;
}
