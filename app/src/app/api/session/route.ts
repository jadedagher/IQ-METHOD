import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session-store';
import { canCreateSession, consumeSessionToken, isDailyBudgetExhausted } from '@/lib/rate-limiter';
import type { WorkflowType, Locale } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // Check daily budget
    if (isDailyBudgetExhausted()) {
      return NextResponse.json(
        { error: 'Daily usage limit reached. Please try again tomorrow.' },
        { status: 429 },
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '127.0.0.1';

    // Rate limit per IP
    if (!canCreateSession(ip)) {
      return NextResponse.json(
        { error: 'Too many sessions. Please wait before creating a new one.' },
        { status: 429 },
      );
    }

    const body = await req.json();
    const workflow = body.workflow as WorkflowType;

    if (workflow !== 'analyst' && workflow !== 'pm') {
      return NextResponse.json(
        { error: 'Invalid workflow. Must be "analyst" or "pm".' },
        { status: 400 },
      );
    }

    const locale: Locale = body.locale === 'en' ? 'en' : 'fr';

    consumeSessionToken(ip);
    const session = createSession(workflow, locale);

    return NextResponse.json({
      sessionId: session.id,
      workflow: session.workflow,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create session.' },
      { status: 500 },
    );
  }
}
