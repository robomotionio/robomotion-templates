# Invoice Inbox to Ledger

Vendor invoices arrive as e-mail and have to end up as bills in the ERP. The re-keying is dull, but
the batch is never quite clean: somewhere in the twelve is an invoice that was already booked, and
one whose amount does not match the purchase order it was raised against. A robot that posts all
twelve blindly pays a duplicate and lets a price mismatch through. The valuable one posts the clean
ones and stops on the two that should not go through.

This flow reads the invoice e-mails, posts each as a bill, and answers the two controls the ERP
raises: a duplicate-reference dialog and a live 3-way match against the purchase order.

It spans two fictional training systems — [Lookout Mail](https://lookout.robomotion.online) for the
inbox and [RAP One](https://rapone.robomotion.online) for the ledger — whose data is entirely
synthetic.

## What it produces

`invoice-posting.csv` in your home folder: every invoice with its outcome — posted, blocked or
skipped — and the ERP document number. On the seeded inbox that is **12 invoices → 10 posted, 1
blocked, 1 skipped**:

- **Skipped** — `INIT-2026-118` is already booked; the ERP raises the duplicate dialog and the robot
  cancels rather than posting a second copy.
- **Blocked** — `NW-2026-9002` fails the 3-way match (invoice net €4,200 against a €3,950 purchase
  order); it posts but is flagged, not payable.
- The remaining ten post clean.

## How it works

### 1. Read the invoices

Sign in to the mailbox and find the vendor-invoice e-mails. Open each and read the vendor, the
reference, the gross amount and any purchase-order number straight out of the message. The net is
derived from the gross at the standard 19% rate — the figure the ERP wants keyed in.

### 2. Post each bill

Sign in to the ERP and, for every invoice, open a new bill: pick the vendor from the typeahead, key
the reference, net and purchase-order link, and save. The ERP runs a live 3-way match against the PO
and a duplicate check against the reference — the two controls the robot has to answer for.

### 3. Handle the controls & report

When the ERP raises the duplicate dialog, the robot cancels. When the 3-way match blocks a bill on a
price mismatch, it is flagged. Everything else posts clean, and the outcome of all twelve lands in
one CSV — the exceptions at the top, ready to work.

## Running it

Ready to run as-is. It signs in with the published training credentials
(`hiroshi.tanaka@globex.example` for the mailbox, `HTANAKA` for the ERP), which are not secret. Real
system credentials belong in the Robomotion Vault, never in a flow.
