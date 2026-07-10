# Monday Morning Briefing

Every Monday, someone opens five browser tabs to find out where the week's work is: the CRM, the
mailbox, the ERP, the carrier portal and the help desk. Each holds a queue; none talks to the others.
This is the demo that ties the whole set together — one robot that visits all five, reads the single
number that matters from each, and hands back one page before anyone has had coffee.

It is the composite of the individual back-office flows — CRM hygiene, invoice posting, bank
reconciliation, shipment tracking and refund triage — reduced to their headline counts and gathered
into a briefing.

It spans five fictional training systems — [Zapspot](https://zapspot.robomotion.online),
[Lookout Mail](https://lookout.robomotion.online), [RAP One](https://rapone.robomotion.online),
[SlugExpress](https://slugexpress.robomotion.online) and
[Grumpdesk](https://grumpdesk.robomotion.online) — whose data is entirely synthetic.

## What it produces

`monday-briefing.csv` in your home folder: one line per system with its headline count, and a total
across all five. On the seeded data that is:

| Area | Items | System |
| --- | --- | --- |
| Duplicate contacts to merge | 12 | Zapspot CRM |
| Invoices to post | 12 | Lookout Mailbox |
| Ledger exceptions to review | 8 | RAP One ERP |
| Shipment exceptions | 30 | SlugExpress Carrier |
| Refund requests to decide | 8 | Grumpdesk Help desk |
| **TOTAL** | **70** | five systems |

## How it works

The robot signs in to each system in turn and reads one number:

1. **CRM — duplicates to merge.** Opens the duplicates view and counts the duplicate pairs.
2. **Mailbox — invoices to post.** Counts the vendor-invoice e-mails in the inbox.
3. **ERP — ledger exceptions.** Filters the vendor bills to exceptions only and reads the count.
4. **Carrier — shipment exceptions.** Opens the exception worklist and reads the count.
5. **Help desk — refunds.** Filters to refund tickets awaiting a decision and counts them.

Then it writes the briefing: one line per system, a total, and where each queue lives — the starting
point for the deeper flows that actually work each queue.

## Running it

Ready to run as-is. It signs in to all five systems with their published training credentials, which
are not secret. Real system credentials belong in the Robomotion Vault, never in a flow.
