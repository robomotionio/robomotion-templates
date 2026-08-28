"""Kestrel support desk - ask the knowledge base a question."""
import json
import urllib.request

URL = "http://127.0.0.1:9090/ask"


def ask(question):
    body = json.dumps({"question": question}).encode()
    request = urllib.request.Request(
        URL, data=body, method="POST",
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read())


print("Kestrel support desk - ask a question, or Ctrl-D to leave.")
while True:
    try:
        question = input("\nyou > ").strip()
    except EOFError:
        break
    if not question:
        continue
    reply = ask(question)
    print()
    for line in reply["answer"].strip().splitlines()[:12]:
        print("  " + line)
    if reply["document"]:
        section = reply["section"].split(" > ")[-1]
        print(f"\n  - {reply['document']} - {section} - {reply['score']}%")
