#!/bin/bash
set -e

# Create docs folder (gitignored - where your knowledge lives)
mkdir -p docs

# Create directories
mkdir -p .opencode/skills
mkdir -p .claude/skills

# Symlink AGENTS.md for both agents (from .ai)
# Need ../ to go up from .opencode/ or .claude/ to root, then into .ai/
ln -sf ../.ai/AGENTS.md .claude/CLAUDE.md
ln -sf ../.ai/AGENTS.md .opencode/AGENTS.md

# Symlink all skills from .ai/skills to both agents
for skill in .ai/skills/*; do
  skill_name=$(basename "$skill")

  # opencode
  ln -sf ../../.ai/skills/"$skill_name" .opencode/skills/"$skill_name"

  # claude code
  ln -sf ../../.ai/skills/"$skill_name" .claude/skills/"$skill_name"
done

echo "Setup complete!"
