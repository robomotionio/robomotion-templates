# Putting it together

One flow over three systems. Headless Chrome reads today's web orders from Acme ERP Web, the finance system is asked about each customer over Remote Desktop, and the orders with nothing overdue are entered into Acme ERP for Windows, line by line, with a report at the end.

The finished flow of the Robomotion Academy lesson **Putting it together** (UI Automation course).

## Before you run it

- The Acme training apps in `C:\Acme`: `AcmeERP-Windows`, `AcmeERP-Java` and `AcmeRemote`, as the course's download unpacks them.
- Input files in `C:\Acme\in`; the flow writes its files to `C:\Acme\out`.
- The training sign-in is in the flow as plain text. In a flow of your own, read it from a vault.
