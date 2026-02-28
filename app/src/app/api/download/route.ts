import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const filename = req.nextUrl.searchParams.get('filename');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
  }

  // Return single file
  if (filename) {
    const artifact = session.artifacts.find(a => a.filename === filename);
    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    return new Response(artifact.content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${artifact.filename}"`,
      },
    });
  }

  // Return all artifacts as JSON (client-side ZIP is preferred)
  return NextResponse.json({
    artifacts: session.artifacts.map(a => ({
      filename: a.filename,
      content: a.content,
    })),
  });
}
