#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PATH="$ROOT/.venv-art"
PYTHON_BIN="$VENV_PATH/bin/python"

if [ ! -x "$PYTHON_BIN" ]; then
  python3 -m venv "$VENV_PATH"
fi

if ! "$PYTHON_BIN" -c "import PIL" >/dev/null 2>&1; then
  "$PYTHON_BIN" -m pip install pillow
fi

exec "$PYTHON_BIN" "$ROOT/tools/generate_final_art.py" "$@"
