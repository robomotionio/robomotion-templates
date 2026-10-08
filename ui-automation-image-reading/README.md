# Reading over Remote Desktop

A flow that logs on to Acme ERP over Remote Desktop, reads the outstanding and overdue totals off the Invoices screen with OCR, each anchored to its label, and writes the overdue share to a CSV file.

The finished flow of the Robomotion Academy lesson **Reading over Remote Desktop** (UI Automation course).

## Before you run it

- The Acme training apps in `C:\Acme`: `AcmeERP-Windows`, `AcmeERP-Java` and `AcmeRemote`, as the course's download unpacks them.
- Input files in `C:\Acme\in`; the flow writes its files to `C:\Acme\out`.
- The training sign-in is in the flow as plain text. In a flow of your own, read it from a vault.
