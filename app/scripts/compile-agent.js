/**
 * Compile the BMAD agent YAMLs (analyst + pm) into web-ready system prompts.
 * Uses the existing BMAD compiler infrastructure.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(__dirname, '..', 'compiled');

const AGENTS = [
  { yaml: 'analyst.agent.yaml', name: 'analyst', output: 'analyst.md' },
  { yaml: 'pm.agent.yaml', name: 'pm', output: 'pm.md' },
];

async function main() {
  const { compileAgent } = require(path.join(ROOT, 'tools/cli/lib/agent/compiler.js'));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const agent of AGENTS) {
    const yamlPath = path.join(ROOT, 'src/bmm/agents', agent.yaml);
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');

    const result = await compileAgent(yamlContent, {}, agent.name, '', {});

    const outPath = path.join(OUTPUT_DIR, agent.output);
    fs.writeFileSync(outPath, result.xml, 'utf8');
    console.log(`Compiled agent → ${path.relative(process.cwd(), outPath)}`);
  }
}

main().catch((error) => {
  console.error('Agent compilation failed:', error);
  process.exit(1);
});
