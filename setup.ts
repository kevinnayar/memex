import { execSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { homedir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

type AgentBootstrapInfo = {
  name: string;
  index: string;
  projectRoot: string;
};

type ConfigurationType = {
  user: string;
  description: string;
  docsPath: string;
};

const log = (value: string) => console.log(`\n=> ${value}...`);

const getAgentsInfo = (projectRoot: string): AgentBootstrapInfo[] => [
  {
    name: "opencode",
    index: "CLAUDE.md",
    projectRoot,
  },
  {
    name: "claude",
    index: "AGENTS.md",
    projectRoot,
  },
];

const loadConfig = (configPath: string): ConfigurationType => {
  if (!existsSync(configPath)) {
    console.error(
      "config.json not found. Copy config.example.json to config.json and update it.",
    );
    process.exit(1);
  }

  try {
    const config = JSON.parse(
      readFileSync(configPath, "utf-8"),
    ) as ConfigurationType;
    console.log(`Setting up memex for ${config.user}...`);

    return config;
  } catch (e) {
    console.error("Config.json was not parseable.");
    process.exit(1);
  }
};

const bootstrapAgent = (agentInfo: AgentBootstrapInfo) => {
  const logPrefix = "  -";
  const agentRoot = `.${agentInfo.name}`;

  console.log(`Creating ${agentRoot} directory...`);
  mkdirSync(join(agentInfo.projectRoot, `${agentRoot}/skills`), {
    recursive: true,
  });

  console.log(`${logPrefix} Creating ${agentInfo.index} symlink...`);
  const agentTarget = join(
    agentInfo.projectRoot,
    `${agentRoot}/${agentInfo.index}`,
  );
  if (existsSync(agentTarget)) {
    unlinkSync(agentTarget);
  }
  symlinkSync(join(agentInfo.projectRoot, ".agents/AGENTS.md"), agentTarget);

  console.log(`${logPrefix} Creating skills symlinks...`);
  const skillsPath = join(agentInfo.projectRoot, ".agents/skills");
  const skills = readdirSync(skillsPath);

  for (const skill of skills) {
    const source = join(skillsPath, skill);
    const target = join(agentInfo.projectRoot, `${agentRoot}/skills`, skill);

    console.log(`${logPrefix} Creating skill symlink for: ${skill}...`);
    if (existsSync(target)) {
      unlinkSync(target);
    }
    symlinkSync(source, target);
  }
};

const generateQmdConfig = (docsPath: string, description: string) => {
  const qmdConfigPath = join(homedir(), ".config/qmd/index.yml");
  mkdirSync(dirname(qmdConfigPath), { recursive: true });

  const yamlContent = `collections:
  memex:
    path: ${docsPath}
    pattern: "**/*.md"
    context:
      "": ${description}
`;

  console.log(`Writing qmcConfig to ${qmdConfigPath}...`);
  writeFileSync(qmdConfigPath, yamlContent);
};

const fixQmdForBun = () => {
  const qmdPath = join(homedir(), ".bun/bin/qmd");
  if (existsSync(qmdPath)) {
    const qmdContent = readFileSync(qmdPath, "utf-8");
    // Check if already patched
    if (!qmdContent.includes("# Force Node")) {
      const patchedContent = qmdContent
        .replace(
          /DIR="\.\.\/\.\.\/bin" && pwd\)/,
          '# Force Node (sqlite-vec crashes on Bun)\nDIR="../../bin")',
        )
        .replace(
          /exec bun "\$DIR\/dist\/cli\/qmd\.js" "\$@"/,
          'exec node "$DIR/dist/cli/qmd.js" "$@"',
        );
      writeFileSync(qmdPath, patchedContent);
    }
  }
};

const qmdIndexAndEmbed = () => {
  try {
    execSync("qmd update", { stdio: "inherit" });
    execSync("qmd embed", { stdio: "inherit" });
  } catch (e) {
    console.warn(
      'Warning: qmd indexing failed. You may need to run "qmd update && qmd embed" manually.',
    );
  }
};

const initializeMemory = (projectRoot: string) => {
  const templatesDir = join(projectRoot, ".agents/memory/templates");
  const memoryDir = join(projectRoot, ".agents/memory");

  if (!existsSync(templatesDir)) {
    console.log("No memory templates found, skipping...");
    return;
  }

  mkdirSync(memoryDir, { recursive: true });

  const templates = readdirSync(templatesDir).filter((f) =>
    f.endsWith(".template.md"),
  );

  for (const template of templates) {
    const source = join(templatesDir, template);
    const baseName = template.replace(".template.md", "");

    if (baseName === "daily") {
      mkdirSync(join(memoryDir, "daily"), { recursive: true });
      console.log(`  Created daily/ directory`);
    } else {
      const target = join(memoryDir, `${baseName}.md`);
      console.log(`  Initializing ${target} from template...`);
      copyFileSync(source, target);
    }
  }
};

const setup = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const projectRoot = __dirname;

  const configPath = join(__dirname, "config.json");
  log(`Loading config from ${configPath}`);
  const config = loadConfig(configPath);

  log("Creating docs directory");
  mkdirSync(config.docsPath, { recursive: true });

  log("Bootstraping agents");
  const agentsInfo = getAgentsInfo(projectRoot);
  await Promise.all(agentsInfo.map(bootstrapAgent));

  log("Initializing memory from templates");
  initializeMemory(projectRoot);

  const docsPath = join(projectRoot, config.docsPath);
  log("Generating qmd config");
  generateQmdConfig(docsPath, config.description);

  log("Fixing qmd for Bun");
  fixQmdForBun();

  log("Indexing docs");
  qmdIndexAndEmbed();

  console.log("Setup complete!");
};

setup().catch((e) => {
  console.error(e);
  process.exit(1);
});
