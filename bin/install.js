#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");

const PACKAGE_NAME = "slack-to-zoom";
const CLAUDE_COMMAND_NAMESPACE = "stz";

function parseArgs(argv) {
  const args = new Set(argv);

  if (args.has("--help") || args.has("-h")) {
    printHelp();
    process.exit(0);
  }

  const runtimes = [];
  if (args.has("--codex")) {
    runtimes.push("codex");
  }
  if (args.has("--claude")) {
    runtimes.push("claude");
  }

  return {
    runtimes,
    scope: args.has("--local") ? "local" : args.has("--global") ? "global" : null
  };
}

function printHelp() {
  console.log(`Usage:
  npx ${PACKAGE_NAME}@latest
  npx ${PACKAGE_NAME}@latest --codex --global
  npx ${PACKAGE_NAME}@latest --codex --local
  npx ${PACKAGE_NAME}@latest --claude --global

Flags:
  --codex   Install the Codex skill
  --claude  Install the Claude skill and slash commands
  --global  Install into ~/.<runtime>
  --local   Install into ./.<runtime> for the current project
  --help    Show this help text
`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeTarget(targetPath) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function copyPackageContents(sourceRoot, targetRoot) {
  const ignore = new Set([
    ".git",
    "node_modules",
    ".DS_Store"
  ]);

  ensureDir(targetRoot);

  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (ignore.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(sourceRoot, entry.name);
    const targetPath = path.join(targetRoot, entry.name);

    fs.cpSync(sourcePath, targetPath, {
      recursive: true,
      force: true,
      dereference: false
    });
  }
}

function linkSkill(sourcePath, linkPath) {
  ensureDir(path.dirname(linkPath));
  removeTarget(linkPath);

  const linkType = process.platform === "win32" ? "junction" : "dir";
  fs.symlinkSync(sourcePath, linkPath, linkType);
}

function writeTextFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
}

function toDisplayPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function rewriteClaudeReferences(contents, suiteRoot) {
  return contents.replaceAll(
    "../../../shared/slack-to-zoom/",
    `${toDisplayPath(path.join(suiteRoot, "shared", "slack-to-zoom"))}/`
  );
}

function rewriteClaudeSkillContents(contents, suiteRoot, claudeRoot) {
  return rewriteClaudeReferences(contents, suiteRoot).replace(
    "commands/stz-migrate.md",
    toDisplayPath(path.join(claudeRoot, "commands", CLAUDE_COMMAND_NAMESPACE, "migrate.md"))
  );
}

function installClaudeCommands(suiteRoot, claudeRoot) {
  const sourceRoot = path.join(
    suiteRoot,
    "claude",
    "skills",
    PACKAGE_NAME,
    "commands"
  );
  const commandRoot = path.join(claudeRoot, "commands", CLAUDE_COMMAND_NAMESPACE);

  removeTarget(commandRoot);
  ensureDir(commandRoot);

  const commandFiles = fs
    .readdirSync(sourceRoot)
    .filter((name) => name.endsWith(".md"))
    .sort();

  for (const fileName of commandFiles) {
    if (!fileName.startsWith("stz-")) {
      continue;
    }

    const sourcePath = path.join(sourceRoot, fileName);
    const targetName = `${fileName.slice(4, -3)}.md`;
    const targetPath = path.join(commandRoot, targetName);
    const contents = fs.readFileSync(sourcePath, "utf8");
    writeTextFile(targetPath, rewriteClaudeReferences(contents, suiteRoot));
  }

  const legacySource = path.join(sourceRoot, "slack-to-zoom-migrate.md");
  const legacyTarget = path.join(claudeRoot, "commands", "slack-to-zoom-migrate.md");
  writeTextFile(
    legacyTarget,
    rewriteClaudeReferences(fs.readFileSync(legacySource, "utf8"), suiteRoot)
  );

  return commandFiles.filter((name) => name.startsWith("stz-")).length + 1;
}

function installClaudeSkill(suiteRoot, claudeRoot) {
  const sourceRoot = path.join(suiteRoot, "claude", "skills", PACKAGE_NAME);
  const targetRoot = path.join(claudeRoot, "skills", PACKAGE_NAME);

  removeTarget(targetRoot);
  ensureDir(targetRoot);

  const skillFiles = ["SKILL.md", "README.md"];
  for (const fileName of skillFiles) {
    const sourcePath = path.join(sourceRoot, fileName);
    const targetPath = path.join(targetRoot, fileName);
    const contents = fs.readFileSync(sourcePath, "utf8");
    const rewritten =
      fileName === "SKILL.md"
        ? rewriteClaudeSkillContents(contents, suiteRoot, claudeRoot)
        : rewriteClaudeReferences(contents, suiteRoot);
    writeTextFile(targetPath, rewritten);
  }
}

function listSkillNames(skillsRoot) {
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return {
    ask(question) {
      return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
      });
    },
    close() {
      rl.close();
    }
  };
}

async function selectRuntimes() {
  const prompt = createPrompt();

  try {
    console.log("Which runtime(s) would you like to install for?\n");
    console.log("  1) Claude Code  (~/.claude)");
    console.log("  2) Codex        (~/.codex)");
    console.log("  3) Both\n");

    const answer = await prompt.ask("Select an option [1-3]: ");
    if (answer === "1") {
      return ["claude"];
    }
    if (answer === "2") {
      return ["codex"];
    }
    if (answer === "3") {
      return ["claude", "codex"];
    }

    console.error("Invalid runtime selection.");
    process.exit(1);
  } finally {
    prompt.close();
  }
}

async function selectScope() {
  const prompt = createPrompt();

  try {
    console.log("\nWhere would you like to install?\n");
    console.log("  1) Global  (home directory config)");
    console.log("  2) Local   (project ./.codex or ./.claude)\n");

    const answer = await prompt.ask("Select an option [1-2]: ");
    if (answer === "1") {
      return "global";
    }
    if (answer === "2") {
      return "local";
    }

    console.error("Invalid scope selection.");
    process.exit(1);
  } finally {
    prompt.close();
  }
}

function installCodex(scope) {
  const packageRoot = path.resolve(__dirname, "..");
  const packageSkillsRoot = path.join(packageRoot, "skills");
  const codexRoot =
    scope === "local"
      ? path.join(process.cwd(), ".codex")
      : path.join(os.homedir(), ".codex");

  const suiteRoot = path.join(codexRoot, PACKAGE_NAME);
  const skillsRoot = path.join(codexRoot, "skills");

  ensureDir(codexRoot);
  ensureDir(skillsRoot);

  removeTarget(suiteRoot);
  copyPackageContents(packageRoot, suiteRoot);

  const skillNames = listSkillNames(packageSkillsRoot);
  for (const skillName of skillNames) {
    const bundledSkill = path.join(suiteRoot, "skills", skillName);
    const skillLink = path.join(skillsRoot, skillName);
    linkSkill(bundledSkill, skillLink);
  }

  console.log(`Installed ${skillNames.length} Codex skills into ${skillsRoot}`);
  console.log(`Installed suite root at ${suiteRoot}`);
}

function installClaude(scope) {
  const packageRoot = path.resolve(__dirname, "..");
  const claudeRoot =
    scope === "local"
      ? path.join(process.cwd(), ".claude")
      : path.join(os.homedir(), ".claude");
  const suiteRoot = path.join(claudeRoot, PACKAGE_NAME);
  const marketplaceRoot = path.join(claudeRoot, "marketplaces", PACKAGE_NAME);

  ensureDir(claudeRoot);
  removeTarget(suiteRoot);
  removeTarget(marketplaceRoot);
  copyPackageContents(packageRoot, suiteRoot);
  installClaudeSkill(suiteRoot, claudeRoot);
  const commandCount = installClaudeCommands(suiteRoot, claudeRoot);

  console.log(`Installed Claude skill into ${path.join(claudeRoot, "skills", PACKAGE_NAME)}`);
  console.log(`Installed ${commandCount} Claude commands into ${path.join(claudeRoot, "commands")}`);
  console.log(`Installed suite root at ${suiteRoot}`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const runtimes = parsed.runtimes.length > 0 ? parsed.runtimes : await selectRuntimes();
  const scope = parsed.scope || await selectScope();

  for (const runtime of runtimes) {
    if (runtime === "codex") {
      installCodex(scope);
      continue;
    }

    if (runtime === "claude") {
      installClaude(scope);
      continue;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
