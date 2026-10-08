# Windows dialogs and grids

A flow that signs in to Acme ERP for Windows, waits for its orders grid, reads it with Get Table Data, exports the orders on hold through the Save As dialog, and closes the app answering its "Save changes?" question.

The finished flow of the Robomotion Academy lesson **Windows dialogs and grids** (UI Automation course).

## Before you run it

- The Acme training apps in `C:\Acme`: `AcmeERP-Windows`, `AcmeERP-Java` and `AcmeRemote`, as the course's download unpacks them.
- Input files in `C:\Acme\in`; the flow writes its files to `C:\Acme\out`.
- The training sign-in is in the flow as plain text. In a flow of your own, read it from a vault.
