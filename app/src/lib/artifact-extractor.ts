import type { Artifact } from '@/types';

/**
 * Extract artifacts from assistant messages.
 * Artifacts are marked with: <!-- ARTIFACT: filename.md -->
 * The content follows until the next artifact marker or end of message.
 *
 * Also supports code blocks preceded by an artifact marker:
 * <!-- ARTIFACT: filename.md -->
 * ```markdown
 * content here
 * ```
 */
export function extractArtifacts(text: string): Artifact[] {
  const artifacts: Artifact[] = [];
  const regex = /<!--\s*ARTIFACT:\s*([^\s>]+)\s*-->/g;
  let match: RegExpExecArray | null;

  const markers: { filename: string; index: number }[] = [];
  while ((match = regex.exec(text)) !== null) {
    markers.push({ filename: match[1], index: match.index + match[0].length });
  }

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length
      ? text.lastIndexOf('<!--', markers[i + 1].index)
      : text.length;

    let content = text.slice(start, end).trim();

    // Strip surrounding code fence if present
    const fenceMatch = content.match(/^```[\w]*\n([\s\S]*?)```\s*$/);
    if (fenceMatch) {
      content = fenceMatch[1].trim();
    }

    if (content) {
      artifacts.push({
        filename: markers[i].filename,
        content,
        extractedAt: Date.now(),
      });
    }
  }

  return artifacts;
}

/**
 * Strip artifact markers from displayed text (for clean rendering).
 */
export function stripArtifactMarkers(text: string): string {
  return text.replace(/<!--\s*ARTIFACT:\s*[^\s>]+\s*-->/g, '');
}
