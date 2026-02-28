/**
 * Copy BMAD workflows for analyst (Mary) and pm (John) into compiled/ directory,
 * transforming {project-root}/_bmad/... paths for web context.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const DEST = path.join(__dirname, '..', 'compiled', 'workflows');

/**
 * Workflow source mappings:
 *   analyst/brainstorming  ← src/core/workflows/brainstorming/
 *   analyst/create-brief   ← src/bmm/workflows/1-analysis/create-product-brief/
 *   analyst/domain-research  ← src/bmm/workflows/1-analysis/research/ (domain-steps + workflow-domain-research.md)
 *   analyst/market-research  ← src/bmm/workflows/1-analysis/research/ (market-steps + workflow-market-research.md)
 *   analyst/technical-research ← src/bmm/workflows/1-analysis/research/ (technical-steps + workflow-technical-research.md)
 *   pm/create-prd          ← src/bmm/workflows/2-plan-workflows/create-prd/
 */

function transformContent(content) {
  return (
    content
      // Brainstorming step paths → relative
      .replaceAll(/\{project-root\}\/_bmad\/core\/workflows\/brainstorming\/steps\/(step-[a-z0-9-]+\.md)/g, 'steps/$1')
      // Brainstorming workflow paths → relative
      .replaceAll(/\{project-root\}\/_bmad\/core\/workflows\/brainstorming\/(workflow\.md)/g, '$1')
      // Brainstorming data files → relative
      .replaceAll(/\{project-root\}\/_bmad\/core\/workflows\/brainstorming\/(brain-methods\.csv|template\.md)/g, '$1')
      // Create-product-brief step paths → relative
      .replaceAll(/\{project-root\}\/_bmad\/bmm\/workflows\/1-analysis\/create-product-brief\/steps\/(step-[a-z0-9-]+\.md)/g, 'steps/$1')
      // Create-product-brief workflow paths → relative
      .replaceAll(/\{project-root\}\/_bmad\/bmm\/workflows\/1-analysis\/create-product-brief\/(workflow\.md)/g, '$1')
      // Research step paths (domain, market, technical) → relative
      .replaceAll(
        /\{project-root\}\/_bmad\/bmm\/workflows\/1-analysis\/research\/(domain|market|technical)-steps\/(step-[a-z0-9-]+\.md)/g,
        'steps/$2',
      )
      // Research workflow paths → relative
      .replaceAll(/\{project-root\}\/_bmad\/bmm\/workflows\/1-analysis\/research\/(workflow-[a-z-]+\.md)/g, '$1')
      // Create-PRD step paths (steps-c, steps-e, steps-v) → relative
      .replaceAll(/\{project-root\}\/_bmad\/bmm\/workflows\/2-plan-workflows\/create-prd\/steps-[cev]\/(step-[a-z0-9-]+\.md)/g, 'steps/$1')
      // Create-PRD workflow paths → relative
      .replaceAll(/\{project-root\}\/_bmad\/bmm\/workflows\/2-plan-workflows\/create-prd\/(workflow-[a-z-]+\.md)/g, '$1')
      // Generic relative step refs (./steps-c/step-XX.md → steps/step-XX.md)
      .replaceAll(/\.\/steps-[cev]\/(step-[a-z0-9-]+\.md)/g, 'steps/$1')
      // Mark unavailable paths
      .replaceAll('{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml', 'UNAVAILABLE_IN_WEB')
      .replaceAll('{project-root}/_bmad/core/workflows/party-mode/workflow.md', 'UNAVAILABLE_IN_WEB')
      .replaceAll('{project-root}/_bmad/bmm/config.yaml', 'EMBEDDED_CONFIG')
      .replaceAll('{project-root}/_bmad/core/tasks/workflow.xml', 'UNAVAILABLE_IN_WEB')
      // Generic {project-root}/_bmad/ refs not yet caught → mark unavailable
      .replaceAll(/\{project-root\}\/_bmad\/[^\s)>]+/g, 'UNAVAILABLE_IN_WEB')
      // {main_config} → EMBEDDED_CONFIG
      .replaceAll('{main_config}', 'EMBEDDED_CONFIG')
      // {nextStep} → steps/step-01-init.md
      .replaceAll('{nextStep}', 'steps/step-01-init.md')
  );
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.yaml') || entry.name.endsWith('.csv')) {
      const content = fs.readFileSync(srcPath, 'utf8');
      fs.writeFileSync(destPath, transformContent(content), 'utf8');
      console.log(`  ${path.relative(DEST, destPath)}`);
    }
  }
}

/**
 * Copy a research sub-workflow (domain, market, or technical).
 * Each has its own steps directory and workflow file inside the research/ folder.
 */
function copyResearchWorkflow(researchDir, variant, destSubDir) {
  const destDir = path.join(DEST, 'analyst', destSubDir);
  fs.mkdirSync(path.join(destDir, 'steps'), { recursive: true });

  // Copy the workflow file
  const workflowFile = path.join(researchDir, `workflow-${variant}-research.md`);
  if (fs.existsSync(workflowFile)) {
    const content = fs.readFileSync(workflowFile, 'utf8');
    fs.writeFileSync(path.join(destDir, 'workflow.md'), transformContent(content), 'utf8');
    console.log(`  analyst/${destSubDir}/workflow.md`);
  }

  // Copy the template
  const templateFile = path.join(researchDir, 'research.template.md');
  if (fs.existsSync(templateFile)) {
    const content = fs.readFileSync(templateFile, 'utf8');
    fs.writeFileSync(path.join(destDir, 'research.template.md'), transformContent(content), 'utf8');
    console.log(`  analyst/${destSubDir}/research.template.md`);
  }

  // Copy steps
  const stepsDir = path.join(researchDir, `${variant}-steps`);
  if (fs.existsSync(stepsDir)) {
    for (const entry of fs.readdirSync(stepsDir)) {
      if (entry.endsWith('.md')) {
        const content = fs.readFileSync(path.join(stepsDir, entry), 'utf8');
        fs.writeFileSync(path.join(destDir, 'steps', entry), transformContent(content), 'utf8');
        console.log(`  analyst/${destSubDir}/steps/${entry}`);
      }
    }
  }
}

function main() {
  // Clean destination
  if (fs.existsSync(DEST)) {
    fs.rmSync(DEST, { recursive: true });
  }

  console.log('Copying workflows:');

  // === ANALYST (Mary) ===

  // 1. Brainstorming
  const brainstormingSrc = path.join(ROOT, 'src/core/workflows/brainstorming');
  copyDir(brainstormingSrc, path.join(DEST, 'analyst', 'brainstorming'));

  // 2. Create Product Brief
  const briefSrc = path.join(ROOT, 'src/bmm/workflows/1-analysis/create-product-brief');
  copyDir(briefSrc, path.join(DEST, 'analyst', 'create-brief'));

  // 3. Research workflows (domain, market, technical)
  const researchDir = path.join(ROOT, 'src/bmm/workflows/1-analysis/research');
  copyResearchWorkflow(researchDir, 'domain', 'domain-research');
  copyResearchWorkflow(researchDir, 'market', 'market-research');
  copyResearchWorkflow(researchDir, 'technical', 'technical-research');

  // === PM (John) ===

  // 1. Create PRD (use steps-c for the create workflow)
  const prdSrc = path.join(ROOT, 'src/bmm/workflows/2-plan-workflows/create-prd');
  const prdDest = path.join(DEST, 'pm', 'create-prd');
  fs.mkdirSync(path.join(prdDest, 'steps'), { recursive: true });
  fs.mkdirSync(path.join(prdDest, 'data'), { recursive: true });
  fs.mkdirSync(path.join(prdDest, 'templates'), { recursive: true });

  // Copy create-prd workflow
  const createWorkflow = path.join(prdSrc, 'workflow-create-prd.md');
  if (fs.existsSync(createWorkflow)) {
    const content = fs.readFileSync(createWorkflow, 'utf8');
    fs.writeFileSync(path.join(prdDest, 'workflow.md'), transformContent(content), 'utf8');
    console.log('  pm/create-prd/workflow.md');
  }

  // Copy steps-c (create mode steps)
  const stepsCDir = path.join(prdSrc, 'steps-c');
  if (fs.existsSync(stepsCDir)) {
    for (const entry of fs.readdirSync(stepsCDir)) {
      if (entry.endsWith('.md')) {
        const content = fs.readFileSync(path.join(stepsCDir, entry), 'utf8');
        fs.writeFileSync(path.join(prdDest, 'steps', entry), transformContent(content), 'utf8');
        console.log(`  pm/create-prd/steps/${entry}`);
      }
    }
  }

  // Copy data files
  const dataDir = path.join(prdSrc, 'data');
  if (fs.existsSync(dataDir)) {
    for (const entry of fs.readdirSync(dataDir)) {
      if (entry.endsWith('.md') || entry.endsWith('.csv')) {
        const content = fs.readFileSync(path.join(dataDir, entry), 'utf8');
        fs.writeFileSync(path.join(prdDest, 'data', entry), transformContent(content), 'utf8');
        console.log(`  pm/create-prd/data/${entry}`);
      }
    }
  }

  // Copy templates
  const templatesDir = path.join(prdSrc, 'templates');
  if (fs.existsSync(templatesDir)) {
    for (const entry of fs.readdirSync(templatesDir)) {
      if (entry.endsWith('.md')) {
        const content = fs.readFileSync(path.join(templatesDir, entry), 'utf8');
        fs.writeFileSync(path.join(prdDest, 'templates', entry), transformContent(content), 'utf8');
        console.log(`  pm/create-prd/templates/${entry}`);
      }
    }
  }

  console.log('Done.');
}

main();
