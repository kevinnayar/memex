#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_PATH="$SCRIPT_DIR/config.json"

bold_green() { printf '\033[1;32m'"$1"'\033[0m\n'; }
log() { printf '  - %s\n' "$1"; }

printf '\033[1;32m
    ███╗   ███╗███████╗███╗   ███╗███████╗██╗  ██╗
    ████╗ ████║██╔════╝████╗ ████║██╔════╝╚██╗██╔╝
    ██╔████╔██║█████╗  ██╔████╔██║█████╗   ╚███╔╝
    ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══╝   ██╔██╗
    ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║███████╗██╔╝ ██╗
    ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
        The machine remembers what you forget
\033[0m'

# ── Dependencies ──────────────────────────────────────────────────────────

install_dependencies() {
  if ! command -v node &> /dev/null; then
    echo "Installing Node.js via nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install --lts
  fi

  if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
  fi

  if ! command -v qmd &> /dev/null; then
    echo "Installing qmd..."
    bun install -g qmd
  fi

  if ! command -v claude &> /dev/null; then
    echo "Warning: Claude Code not found. Install it from https://claude.ai/code"
  fi
}

# ── Config ────────────────────────────────────────────────────────────────

json_field() {
  python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d.get(sys.argv[2],''))" "$CONFIG_PATH" "$1"
}

create_config() {
  echo ""
  echo "=== Memex Setup ==="
  echo ""
  echo "Let's set up your config.json"
  echo ""

  local user="" description="" docs_path=""

  while [[ -z "$user" ]]; do
    read -rp "Your name: " user
    [[ -z "$user" ]] && echo "Name is required."
  done

  echo ""
  echo "Description of your notes (for semantic search context):"
  echo "Example: Personal notes about engineering, hiking, and cooking"
  echo ""
  while [[ -z "$description" ]]; do
    read -rp "Description: " description
    [[ -z "$description" ]] && echo "Description is required."
  done

  read -rp $'\nPath to your notes folder (default: docs): ' docs_path_input
  docs_path="${docs_path_input:-docs}"

  echo ""
  echo "=== Config Summary ==="
  echo ""
  python3 -c "
import json
config = {'user': '$user', 'description': '$description', 'docsPath': '$docs_path'}
print(json.dumps(config, indent=2))
"
  echo ""

  read -rp "Looks good? (yes/no): " confirmed
  if [[ "$confirmed" != "yes" && "$confirmed" != "y" ]]; then
    echo ""
    echo "Let's try again..."
    create_config
    return
  fi

  python3 -c "
import json
config = {'user': '$user', 'description': '$description', 'docsPath': '$docs_path'}
with open('$CONFIG_PATH', 'w') as f:
    json.dump(config, f, indent=2)
"
  echo "Created $CONFIG_PATH"
}

load_config() {
  if [[ -f "$CONFIG_PATH" ]] && python3 -c "import json; json.load(open('$CONFIG_PATH'))" 2>/dev/null; then
    echo "Config loaded"
    USER_NAME=$(json_field user)
    DESCRIPTION=$(json_field description)
    DOCS_PATH=$(json_field docsPath)
    DOCS_PATH="${DOCS_PATH:-docs}"
  else
    [[ -f "$CONFIG_PATH" ]] && echo "config.json is not valid JSON. Let's recreate it."
    create_config
    USER_NAME=$(json_field user)
    DESCRIPTION=$(json_field description)
    DOCS_PATH=$(json_field docsPath)
    DOCS_PATH="${DOCS_PATH:-docs}"
  fi
}

# ── Gitignore ─────────────────────────────────────────────────────────────

update_gitignore() {
  local gitignore="$SCRIPT_DIR/.gitignore"
  if ! grep -qxF "$DOCS_PATH" "$gitignore" 2>/dev/null; then
    echo "$DOCS_PATH" >> "$gitignore"
    log "Added $DOCS_PATH to .gitignore"
  else
    log "$DOCS_PATH already in .gitignore, skipping..."
  fi
}

# ── Agent Bootstrap ────────────────────────────────────────────────────────

bootstrap_agent() {
  local name="$1"
  local agent_root=".$name"
  local agent_dir="$SCRIPT_DIR/$agent_root"
  local source_agents="$SCRIPT_DIR/docs/agents"

  echo "Creating $agent_root directory..."
  mkdir -p "$agent_dir/skills"

  log "Creating CLAUDE.md symlink..."
  ln -sf "$source_agents/AGENTS.md" "$agent_dir/CLAUDE.md"

  log "Cleaning old skill symlinks..."
  local skills_dir="$agent_dir/skills"
  local source_skills="$source_agents/skills"
  if [[ -d "$skills_dir" ]]; then
    while IFS= read -r skill_name; do
      [[ -n "$skill_name" ]] || continue
      if [[ ! -d "$source_skills/$skill_name" ]]; then
        rm -rf "${skills_dir:?}/$skill_name"
        log "Removed old symlink: $skill_name"
      fi
    done < <(ls "$skills_dir" 2>/dev/null)
  fi

  log "Creating skills symlinks..."
  for skill_path in "$source_skills"/*/; do
    [[ -d "$skill_path" ]] || continue
    local skill
    skill=$(basename "$skill_path")
    log "Creating skill symlink for: $skill..."
    ln -sf "$source_skills/$skill" "$skills_dir/$skill"
  done

  local commands_dir="$agent_dir/commands"
  mkdir -p "$commands_dir"

  log "Cleaning old command symlinks..."
  if [[ -d "$commands_dir" ]]; then
    while IFS= read -r cmd_name; do
      [[ -n "$cmd_name" ]] || continue
      local skill_name="${cmd_name%.md}"
      if [[ ! -d "$source_skills/$skill_name" ]]; then
        rm -f "${commands_dir:?}/$cmd_name"
        log "Removed stale command: $cmd_name"
      fi
    done < <(ls "$commands_dir" 2>/dev/null)
  fi

  log "Creating command symlinks..."
  for skill_path in "$source_skills"/*/; do
    [[ -d "$skill_path" ]] || continue
    local skill
    skill=$(basename "$skill_path")
    log "Creating command symlink for: $skill..."
    ln -sf "$source_skills/$skill/SKILL.md" "$commands_dir/$skill.md"
  done

  if [[ "$name" == "claude" ]]; then
    for file in settings.json memex-logo.sh; do
      log "Creating $file symlink..."
      ln -sf "$source_agents/$file" "$agent_dir/$file"
    done
  fi
}

# ── Agent Files Init ───────────────────────────────────────────────────────

AGENTS_MD_CREATED=false

initialize_agent_files() {
  local agents_dir="$SCRIPT_DIR/$DOCS_PATH/agents"
  local daily_dir="$SCRIPT_DIR/$DOCS_PATH/daily"
  local templates_dir="$SCRIPT_DIR/templates"

  mkdir -p "$agents_dir" "$daily_dir"

  while IFS= read -r template; do
    local rel="${template#$templates_dir/}"
    local dest="$agents_dir/$rel"
    if [[ -f "$dest" ]]; then
      log "$rel exists, skipping..."
    else
      mkdir -p "$(dirname "$dest")"
      sed "s|{{docsPath}}|$DOCS_PATH|g" "$template" > "$dest"
      log "Created $rel"
      [[ "$rel" == "AGENTS.md" ]] && AGENTS_MD_CREATED=true
    fi
  done < <(find "$templates_dir" -type f | sort)
}

# ── qmd Config ─────────────────────────────────────────────────────────────

generate_qmd_config() {
  local qmd_config="$HOME/.config/qmd/index.yml"
  mkdir -p "$(dirname "$qmd_config")"

  cat > "$qmd_config" << EOF
collections:
  memex-docs:
    path: $SCRIPT_DIR/$DOCS_PATH
    pattern: "**/*.md"
    context:
      "": $DESCRIPTION
  memex-memory:
    path: $SCRIPT_DIR/$DOCS_PATH/agents
    pattern: "**/*.md"
EOF

  echo "Writing qmd config to $qmd_config..."
}

qmd_force_nodejs() {
  local qmd_path="$HOME/.bun/bin/qmd"
  if [[ -f "$qmd_path" ]] && ! grep -q "# Force Node" "$qmd_path"; then
    perl -i -pe 's|DIR="../../bin" && pwd\)|# Force Node (sqlite-vec crashes on Bun)\nDIR="../../bin")|' "$qmd_path"
    perl -i -pe 's|exec bun "\$DIR/dist/cli/qmd\.js" "\$\@"|exec node "\$DIR/dist/cli/qmd.js" "\$\@"|' "$qmd_path"
  fi
}

qmd_index_and_embed() {
  if command -v qmd &> /dev/null; then
    qmd update && qmd embed || echo 'Warning: qmd indexing failed. Run "qmd update && qmd embed" manually.'
  else
    echo "qmd not found, skipping indexing."
  fi
}

# ── Main ───────────────────────────────────────────────────────────────────

bold_green "\nInstalling dependencies"
install_dependencies

bold_green "\nLoading config"
load_config

bold_green "\nUpdating .gitignore"
update_gitignore

bold_green "\nCreating docs directory"
mkdir -p "$SCRIPT_DIR/$DOCS_PATH"

bold_green "\nBootstrapping agents"
bootstrap_agent claude
bootstrap_agent opencode

bold_green "\nInitializing agent files"
initialize_agent_files

bold_green "\nGenerating qmd config"
generate_qmd_config

bold_green "\nSetup NodeJS for qmd"
qmd_force_nodejs

bold_green "\nIndexing docs"
qmd_index_and_embed

bold_green "\n=== Setup complete! ==="
printf '  \n  Your memex is ready\n  Start adding notes to: %s/\n  or ask me to remember something.\n' "$DOCS_PATH"

if [[ "$AGENTS_MD_CREATED" == true ]]; then
  printf '\n\033[1;33m  AGENTS.md is empty.\033[0m\n'
  printf '  Open Claude Code or OpenCode and say:\n'
  printf '  "Help me set up my AGENTS.md — ask me questions about how I want you to behave and what my notes are about."\n\n'
fi
