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
import { createInterface } from "readline";
import { fileURLToPath } from "url";

type ConfigurationType = {
  user: string;
  description: string;
  docsPath: string;
};

type AgentBootstrapInfo = {
  name: string;
  index: string;
  projectRoot: string;
};

const SUPPORTED_AGENTS: Omit<AgentBootstrapInfo, "projectRoot">[] = [
  {
    name: "opencode",
    index: "CLAUDE.md",
  },
  {
    name: "claude",
    index: "AGENTS.md",
  },
];

const log = (value: string) => console.log(`\n${value}...`);

const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const createConfig = async (configPath: string): Promise<ConfigurationType> => {
  let user = "";
  let description = "";

  console.log("\n=== Memex Setup ===\n");
  console.log("Let's set up your config.json\n");

  while (!user.trim()) {
    user = await prompt("Your name: ");
    if (!user.trim()) {
      console.log("Name is required.\n");
    }
  }

  console.log("\nDescription of your notes (for semantic search context):");
  console.log(
    "Example: Personal notes about engineering, hiking, and cooking\n",
  );
  while (!description.trim()) {
    description = await prompt("Description: ");
    if (!description.trim()) {
      console.log("Description is required.\n");
    }
  }

  const config: ConfigurationType = {
    user: user.trim(),
    description: description.trim(),
    docsPath: "docs",
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\nCreated ${configPath}`);
  return config;
};

const loadConfig = async (configPath: string): Promise<ConfigurationType> => {
  if (!existsSync(configPath)) {
    return createConfig(configPath);
  }

  try {
    const config = JSON.parse(
      readFileSync(configPath, "utf-8"),
    ) as ConfigurationType;
    return config;
  } catch {
    console.error("config.json is not valid JSON. Let's recreate it.\n");
    return createConfig(configPath);
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

const qmdForceNodeJS = () => {
  const qmdPath = join(homedir(), ".bun/bin/qmd");
  if (existsSync(qmdPath)) {
    const qmdContent = readFileSync(qmdPath, "utf-8");
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
  } catch {
    console.warn(
      'Warning: qmd indexing failed. You may need to run "qmd update && qmd embed" manually.',
    );
  }
};

const setup = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const projectRoot = __dirname;

  const configPath = join(__dirname, "config.json");
  log(`Loading config`);
  const config = await loadConfig(configPath);
  log(`Setting up memex for ${config.user}`);

  log("Creating docs directory");
  mkdirSync(config.docsPath, { recursive: true });

  log("Bootstrapping agents");
  const agentsInfo = SUPPORTED_AGENTS.map(
    (a) => ({ ...a, projectRoot }) satisfies AgentBootstrapInfo,
  );
  await Promise.all(agentsInfo.map(bootstrapAgent));

  log("Initializing memory from templates");
  initializeMemory(projectRoot);

  const docsPath = join(projectRoot, config.docsPath);
  log("Generating qmd config");
  generateQmdConfig(docsPath, config.description);

  log("Setup NodeJS for qmd");
  qmdForceNodeJS();

  log("Indexing docs");
  qmdIndexAndEmbed();

  log("\n=== Setup complete! ===");
  log(
    `Your memex is ready. Start adding notes to ${config.docsPath}/ "or ask me to remember something.`,
  );
};

setup().catch((e) => {
  console.error(e);
  process.exit(1);
});
