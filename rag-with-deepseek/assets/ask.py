#!/usr/bin/env python3
"""Talk to the RAG with DeepSeek flow from a terminal.

The flow listens on http://127.0.0.1:3000/ask. Send it a question, get an answer
back that cites the documents it came from.

    python3 ask.py                       # chat, one question per line
    python3 ask.py "what is the per diem" # one question and out

Standard library only, so there is nothing to install. Start the flow on a robot
first: the endpoint only exists while the flow is running.
"""

import json
import sys
import textwrap
import time
import urllib.error
import urllib.request

URL = "http://127.0.0.1:3000/ask"
TIMEOUT = 300  # the first question builds the knowledge base, which is not quick

DIM = "\033[2m"
BOLD = "\033[1m"
CYAN = "\033[36m"
GREEN = "\033[32m"
RED = "\033[31m"
OFF = "\033[0m"


def ask(question):
    """POST the question, return the answer. Raises on transport failure."""
    payload = json.dumps({"question": question}).encode("utf-8")
    request = urllib.request.Request(
        URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    started = time.time()
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        raw = response.read().decode("utf-8")
    elapsed = time.time() - started

    try:
        body = json.loads(raw)
    except json.JSONDecodeError:
        return raw, elapsed
    return body.get("answer", raw), elapsed


def show(answer, elapsed):
    width = min(96, max(60, (getattr(sys.stdout, "isatty", lambda: False)() and 96) or 80))
    print()
    for block in str(answer).split("\n"):
        if not block.strip():
            print()
            continue
        for line in textwrap.wrap(block, width=width) or [""]:
            print("  " + line)
    print(f"\n{DIM}  {elapsed:.1f}s{OFF}\n")


def main():
    if len(sys.argv) > 1:
        answer, elapsed = ask(" ".join(sys.argv[1:]))
        show(answer, elapsed)
        return

    print(f"{BOLD}Company policy assistant{OFF}  {DIM}{URL}{OFF}")
    print(f"{DIM}Ask a question. Ctrl-C to leave.{OFF}\n")

    while True:
        try:
            question = input(f"{CYAN}you{OFF} > ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if not question:
            continue
        if question in {"exit", "quit"}:
            return

        try:
            answer, elapsed = ask(question)
        except urllib.error.URLError as exc:
            print(f"\n{RED}  cannot reach the flow at {URL}{OFF}")
            print(f"{DIM}  is it running on a robot? ({exc.reason}){OFF}\n")
            continue

        print(f"{GREEN}agent{OFF} >", end="")
        show(answer, elapsed)


if __name__ == "__main__":
    main()
