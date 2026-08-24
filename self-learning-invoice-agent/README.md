# Self-Learning Invoice Agent

Self-Learning Invoice Agent is an invoice-processing flow built around the DeepSeek Agent node's learning feature. The agent reads a supplier invoice PDF, extracts the vendor, invoice number, invoice date and grand total, and records them to a CSV ledger through an `add_invoice_row` tool built from ordinary flow nodes. The first invoice from a vendor is worked out from scratch; the agent then writes the whole procedure down as a learned skill in its memory, and every invoice after from that vendor runs on what it learned.

This is AI and RPA working together: the agent decides what to record, and the flow between Tool In and Tool Out records it.

## What Self-Learning Invoice Agent can do

- Pick up the next invoice PDF from `~/Invoices/inbox` on every run
- Extract vendor, invoice number, invoice date and grand total from the document
- Record exactly one ledger row per invoice via the `add_invoice_row` tool into `~/Invoices/accounting.csv`
- Learn each vendor's layout once: which line holds the real total, which of the dates is the invoice date, how numbers are formatted
- Reuse the learned skill on every later invoice from that vendor, with no re-derivation
- Archive processed invoices to `~/Invoices/processed`
- Sync its memory to the workspace as a git repository, so what one robot learns is available to every robot running this flow

## Behind the scenes

The flow lists `~/Invoices/inbox`, picks the first PDF, and hands it to the DeepSeek Agent node together with a request naming the exact file. The agent reads the document (its persona, in the Context tab, tips it to `pdftotext -layout`), decides the field values, and calls `add_invoice_row`. That tool is plain flow: Tool In receives the call's parameters, a Function node shapes them into a one-row table, Append CSV writes the ledger, and Tool Out hands the result back to the agent. The agent's reply leaves on its response port, the invoice is moved to `~/Invoices/processed`, and the run ends.

Because the node's Learning property is On, a turn that worked a new layout out ends with the agent recording the procedure via its `learn` tool. Everything about the agent lives behind a double-click on the node: the learned skill, the memory's commit history, version tags, and a Growth view that replays how the memory grew. A learned skill can be promoted to reviewed, pinned to a digest, and tagged as a version; a robot whose Memory Version names that tag replays exactly the reviewed state and records nothing new.

## Setup Guide

1. **Create the working folders and the ledger** (the ledger needs its header row to exist):
   `mkdir -p ~/Invoices/inbox ~/Invoices/processed`
   `echo "vendor,invoice_number,date,total,currency" > ~/Invoices/accounting.csv`
2. **Configure the API key:** put an OpenRouter API key into a Vault item (type: API Key) and select it in the Invoice Agent node's **API Key** property. The node's default Base URL and model (`deepseek/deepseek-v4-pro`) already match OpenRouter.
3. **Drop an invoice PDF** into `~/Invoices/inbox`.
4. **Run the flow** on a robot and watch the turn stream in the Dev Console's **Agents** tab.
5. **Run it again** with a second invoice from the same vendor: the skill is offered back to the agent and nothing is re-derived.
6. **Inspect the memory:** double-click the Invoice Agent node and open the **Memory** tab to read the skill the agent wrote, its commit history, and the Growth view.

## Customization

The agent's persona lives in the flow's `AGENT.md` asset (visible in the agent editor's Context tab): adjust the fields to extract, the exactness rules, or the learning instruction there. The tool's contract is the Tool In node's description and parameter schema; extend the schema and the Build Row function together to record more columns. Swap Append CSV for a Google Sheets or database node to land rows somewhere other than a local file. In the node's properties, Learning and Memory Sync control whether the agent may learn and where its memory lives; set Learning to Replay with a pinned Memory Version on fleet robots that should run exactly what was reviewed.
