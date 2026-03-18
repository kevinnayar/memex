# Memex

> A memex (a portmanteau of "memory" and "index") is a hypothetical electromechanical device for interacting with microform documents and described in Vannevar Bush's 1945 article "As We May Think". Bush envisioned the memex as a device in which individuals would compress and store all of their books, records, and communications, "mechanized so that it may be consulted with exceeding speed and flexibility". The individual was supposed to use the memex as an automatic personal filing system, making the memex "an enlarged intimate supplement to his memory".

— [Wikipedia](https://en.wikipedia.org/wiki/Memex)

## Setup

```bash
# Install qmd (requires Node, not Bun - sqlite-vec crashes on Bun)
bun install -g https://github.com/tobi/qmd

# Fix qmd to use Node instead of Bun (if needed)
# Edit ~/.bun/bin/qmd and replace the exec line:
#   exec node "$DIR/dist/cli/qmd.js" "$@"

# Configure qmd to index docs folder (update path for your machine)
mkdir -p ~/.config/qmd
cat > ~/.config/qmd/index.yml << 'EOF'
collections:
  memex:
    path: /Users/kevinnayar/src/memex/docs
    pattern: "**/*.md"
    context:
      "": Kevin's personal notes, documentation, knowledge base, and ideas
EOF

# Run setup script (creates docs/ folder if missing)
./setup.sh

# Index docs (BM25 + vectors)
qmd update && qmd embed
```

**Note:** The `docs/` folder is gitignored - this is where your knowledge lives. The setup script creates it automatically.
