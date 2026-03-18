# Notes

## qmd behavior

- When user asks to "index", they mean both `qmd update` (BM25) AND `qmd embed` (vectors). Run both for full functionality.
- sqlite-vec crashes on Bun. To fix, edit `~/.bun/bin/qmd` to use Node instead:
  ```
  NODE=$(command -v node)
  exec "$NODE" "$DIR/dist/cli/qmd.js" "$@"
  ```
