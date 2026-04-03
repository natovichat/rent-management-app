#!/usr/bin/env python3
"""
run_bot_prompt.py
─────────────────
Runs the telegram bot's agent logic directly (no Telegram needed)
and prints the response to stdout.

Usage:
  python3 run_bot_prompt.py "your prompt" [/path/to/project]

Exit codes:
  0 — success
  1 — error (printed to stderr)
"""

import asyncio
import sys
from pathlib import Path

# Load bot from its installed location
BOT_PATH = Path.home() / "Code" / "tools"
sys.path.insert(0, str(BOT_PATH))

try:
    from telegram_agent_bot import (
        Session,
        _load_project_snapshot,
        run_agent,
    )
except ImportError as e:
    print(f"ERROR: Cannot import bot — {e}", file=sys.stderr)
    print(f"Expected bot at: {BOT_PATH}/telegram_agent_bot.py", file=sys.stderr)
    sys.exit(1)


async def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: run_bot_prompt.py <prompt> [project_path]", file=sys.stderr)
        sys.exit(1)

    prompt = sys.argv[1]
    project = Path(sys.argv[2]) if len(sys.argv) > 2 else Path.home() / "personal" / "rentApplication"

    if not project.exists():
        print(f"ERROR: Project path does not exist: {project}", file=sys.stderr)
        sys.exit(1)

    session = Session()
    session.context = "personal" if "personal" in str(project) else "work"
    session.project = project
    session.snapshot = _load_project_snapshot(project)

    response = await run_agent(session, prompt)
    print(response)


asyncio.run(main())
