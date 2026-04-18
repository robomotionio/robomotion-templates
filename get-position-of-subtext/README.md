# Get Position of Subtext

Searching for keywords is usually expected after text extraction, especially when specific values must be handled independently. Robomotion provides "Parse Text" nodes to make parsing text and searching subtexts feasible in flows.

## What Get Position of Subtext can do

- `Core.Dialog.InputBox` titled `Get position of a subtext` prompts `Populate your text:` with default `I love Robomotion!` → `msg.text_var`.
- Second `Core.Dialog.InputBox` prompts `Populate the subtext to look for:` with default `Robomotion` → `msg.subtext_var`.
- `Find Position` (`Core.Programming.Function`, `outputs: 2`) — computes `msg.position = msg.text_var.indexOf(msg.subtext_var)`; emits on output `0` when `msg.position >= 0`, otherwise output `1`.
- Found path: `Build Found Text` (`Core.Programming.Function`) sets `msg.dialog_text = "The subtext '<s>' begins at character  <pos>"`, then `Core.Dialog.MessageBox` titled `Flow ran successfully!` shows it.
- Not-found path: `Build Not Found Text` (`Core.Programming.Function`) sets `msg.dialog_text = "The subtext '<s>' wasn't found in the given text. "`, then a second `Core.Dialog.MessageBox` with the same title shows it; both paths converge on `Core.Flow.Stop`.

## Behind the scenes

- `String.prototype.indexOf` returns `-1` when not found, so the branch guard uses `>= 0` and keeps the "not found" payload intact on output `1`.
- The match is case-sensitive (`indexOf`); swap for `toLowerCase()` on both sides if you need case-insensitive matching.
- The success message intentionally has a **double space** before the position number — preserved for visual fidelity with the original template.
- Both branches use `msg.dialog_text` as the payload, so the two message-box nodes stay symmetric and easy to restyle together.
