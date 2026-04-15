# Share PowerPoint File as PDF

**Level:** Advanced

## Description
Handling Windows and desktop applications is an essential part of most automation scenarios. UI automation nodes and recording enable you to launch applications like Microsoft PowerPoint, navigate through their environment, and automate repetitive tasks on them.

## Objective
Open a `.pptx` file in Microsoft PowerPoint, export it to PDF via the built-in "Export → Create PDF/XPS" flow, and then email the resulting PDF to a configured recipient.

## Prerequisites
- Windows with Microsoft PowerPoint installed
- Robomotion Desktop package + UI Automation
- Robomotion Mail (SMTP) package, or an Outlook UI flow for the send step
- Source deck `./decks/quarterly.pptx`
- Output folder `./decks/exports/`
- Recipient address in a Flow variable

## Steps
### Phase 1 — Convert to PDF
1. **Run Application** — launch PowerPoint with the deck path as argument → `vApp`.
2. **Wait For Window** — title contains the deck filename.
3. **Send Keys** `Alt+F` → `E` → `A` to open Export → Create PDF/XPS (or click through the ribbon via UI Automation for robustness).
4. **Wait For Window** — "Publish as PDF or XPS".
5. **Set Text** on the File name field → `./decks/exports/quarterly.pdf`.
6. **Click** "Publish".
7. **Wait For File** — poll until `quarterly.pdf` exists on disk.
8. **Close Window** — shut PowerPoint down (dismiss "save changes?" if prompted).

### Phase 2 — Share
Option A — SMTP:
9. **Send Mail** — attach the PDF, subject "Quarterly deck — PDF", body templated from a Flow variable.

Option B — Outlook UI:
9. **Run Application** — `outlook.exe`.
10. **Send Keys** `Ctrl+Shift+M` for a new message.
11. **Set Text** To, Subject; **Attach File** `quarterly.pdf`; **Send Keys** `Alt+S`.

## Expected Outcome
`./decks/exports/quarterly.pdf` exists and is a faithful render of the deck, and the recipient inbox receives the email with the PDF attached.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vDeck` | Flow | Source `.pptx` path |
| `vPdf` | Flow | Output PDF path |
| `vRecipient` | Flow | Email address |
| `vApp` / `vWindow` | Message | PowerPoint handles |

## Notes
- Ribbon keystrokes (`Alt+F` → `E` → `A`) are more stable across Office builds than coordinate-based clicks, but confirm on the target version.
- Prefer SMTP over Outlook UI for unattended runs — the UI path breaks when there's no interactive session.
- This is the capstone of the Desktop Automation track: it chains app control, file system, waiting patterns, and external integration (mail) into one flow.
