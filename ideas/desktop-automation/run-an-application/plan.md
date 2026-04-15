# Run an Application

**Level:** Beginner

## Description
Before automating any tasks on your desktop, you have to launch the appropriate application that will perform them. Robomotion allows you to launch virtually any application or file using the "Run Application" action.

## Objective
Launch a desktop application (Notepad/Calculator on Windows, or an equivalent on Linux/macOS), wait for its window to appear, and then close it cleanly.

## Prerequisites
- Robomotion Desktop package
- Target application installed (e.g. `notepad.exe`)

## Steps
1. **Run Application** — launch `notepad.exe`. Store the returned PID/handle in `vApp`.
2. **Wait For Window** — wait for a window whose title matches `*Notepad*`, store handle in `vWindow`.
3. **Delay** — a couple of seconds so the learner sees the app render.
4. **Close Window** (or **Kill Process** using `vApp`) — shut the app down.

## Expected Outcome
Notepad opens, pauses briefly, and closes automatically. No orphan process remains.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vApp` | Message | Process handle |
| `vWindow` | Message | Window handle |

## Notes
This plan is the foundation for every desktop-UI tutorial that follows — later tutorials (Send Text to Notepad, GUI Testing Calculator, Share PowerPoint as PDF) all reuse this launch pattern.
