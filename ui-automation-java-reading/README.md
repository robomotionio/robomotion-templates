# Reading from a Java application

A flow that signs in to Acme ERP (Java Edition), reads a customer's credit limit and the fasteners in the product table, works out how many boxes of each the limit covers, and writes the answer to a CSV file.

The finished flow of the Robomotion Academy lesson **Reading from a Java application** (UI Automation course).

## Before you run it

- The Acme training apps in `C:\Acme`: `AcmeERP-Windows`, `AcmeERP-Java` and `AcmeRemote`, as the course's download unpacks them.
- Input files in `C:\Acme\in`; the flow writes its files to `C:\Acme\out`.
- The training sign-in is in the flow as plain text. In a flow of your own, read it from a vault.
