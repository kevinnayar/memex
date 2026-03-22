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

const color = (message: string, makeBold: boolean = true): string => {
  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  const color = "\x1b[32m"; // green

  let code = "";
  if (makeBold) code += bold;
  code += color;

  return code ? `${code}${message}${reset}` : message;
};

const LOGO = `
    ███╗   ███╗███████╗███╗   ███╗███████╗██╗  ██╗
    ████╗ ████║██╔════╝████╗ ████║██╔════╝╚██╗██╔╝
    ██╔████╔██║█████╗  ██╔████╔██║█████╗   ╚███╔╝ 
    ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══╝   ██╔██╗ 
    ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║███████╗██╔╝ ██╗
    ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
        The machine remembers what you forget     
`;

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
  let docsPath = "docs";

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

  const docsPathInput = await prompt(
    "\nPath to your notes folder (default: docs): ",
  );
  if (docsPathInput.trim()) {
    docsPath = docsPathInput.trim();
  }

  const config: ConfigurationType = {
    user: user.trim(),
    description: description.trim(),
    docsPath,
  };

  console.log("\n=== Config Summary ===\n");
  console.log(JSON.stringify(config, null, 2));
  console.log("");

  const confirmed = await prompt("Looks good? (yes/no): ");
  if (confirmed.toLowerCase() !== "yes" && confirmed.toLowerCase() !== "y") {
    console.log("\nLet's try again...\n");
    return createConfig(configPath);
  }

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
    console.log("Config loaded");
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

  console.log(`${logPrefix} Cleaning old skill symlinks...`);
  const agentSkillsDir = join(agentInfo.projectRoot, `${agentRoot}/skills`);
  const currentSymlinks = readdirSync(agentSkillsDir);
  const sourceSkillsDir = join(agentInfo.projectRoot, ".agents/skills");
  const sourceSkills = readdirSync(sourceSkillsDir);

  for (const symlink of currentSymlinks) {
    if (!sourceSkills.includes(symlink)) {
      const symlinkPath = join(agentSkillsDir, symlink);
      unlinkSync(symlinkPath);
      console.log(`${logPrefix} Removed old symlink: ${symlink}`);
    }
  }

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
  const templatesDir = join(projectRoot, ".agents/memory.templates");
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

const generateQmdConfig = (
  projectRoot: string,
  docsPath: string,
  description: string,
) => {
  const qmdConfigPath = join(homedir(), ".config/qmd/index.yml");
  mkdirSync(dirname(qmdConfigPath), { recursive: true });

  const absoluteDocsPath = join(projectRoot, docsPath);
  const absoluteMemoryPath = join(projectRoot, ".agents/memory");

  const yamlContent = `collections:
  memex-docs:
    path: ${absoluteDocsPath}
    pattern: "**/*.md"
    context:
      "": ${description}
  memex-memory:
    path: ${absoluteMemoryPath}
    pattern: "**/*.md"
`;

  console.log(`Writing qmd config to ${qmdConfigPath}...`);
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

const main = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const projectRoot = __dirname;

  console.log(color(`\n${LOGO}\n`, false));

  const configPath = join(__dirname, "config.json");
  console.log(color("\nLoading config"));
  const config = await loadConfig(configPath);

  console.log(color("\nCreating docs directory"));
  mkdirSync(config.docsPath, { recursive: true });

  console.log(color("\nBootstrapping agents"));
  const agentsInfo = SUPPORTED_AGENTS.map(
    (a) => ({ ...a, projectRoot }) satisfies AgentBootstrapInfo,
  );
  await Promise.all(agentsInfo.map(bootstrapAgent));

  console.log(color("\nInitializing memory from templates"));
  initializeMemory(projectRoot);

  console.log(color("\nGenerating qmd config"));
  generateQmdConfig(projectRoot, config.docsPath, config.description);

  console.log(color("\nSetup NodeJS for qmd"));
  qmdForceNodeJS();

  console.log(color("\nIndexing docs"));
  qmdIndexAndEmbed();

  console.log(color("\n=== Setup complete! ==="));
  console.log(
    [
      "  ",
      "Your memex is ready",
      `Start adding notes to: ${config.docsPath}/`,
      "or ask me to remember something.",
    ].join("\n  "),
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
