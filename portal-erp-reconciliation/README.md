# Tax Portal ERP Reconciliation

Two systems are supposed to hold the same set of documents: the government tax portal, where every
supplier files an e-invoice, and the ERP, where finance books every bill. When they disagree,
nobody notices until an audit — a bill that was never filed, an e-invoice that was never booked, a
gross amount off by two cents. The valuable robot reconciles the two on a schedule and reports every
gap while it is still cheap to fix.

This flow does exactly that. It reads the portal's received e-invoices, counts the matching bills in
the ERP, and reports the three ways they can disagree.

It spans two fictional training systems — [FRS](https://frs.robomotion.online), a government tax
portal, and [RAP One](https://rapone.robomotion.online), the ERP — whose data is entirely synthetic.

## What it produces

`portal-erp-reconciliation.csv` in your home folder: every enrolled vendor with its ERP bill count
against its portal e-invoice count, plus the three exception classes. On the seeded data that is
**62 received e-invoices across 6 enrolled vendors**, and three findings:

- **Amount drift** — one e-invoice whose gross is €0.02 over the ERP bill (a rounding tolerance to
  classify).
- **Not found in ERP** — two portal-only e-invoices with no bill (arrived in the portal, never
  booked).
- **Missing in portal** — one vendor whose ERP bill count exceeds its e-invoice count by one (a bill
  booked but never filed).

## How it works

### 1. Read the portal

Two-factor sign in as the company, filter the register to received e-invoices, and page through
every result ten at a time — stopping when the pager reports no next page, not after a hardcoded
count. Each row carries the counterparty and gross; the portal itself tags an amount drift or an
e-invoice it could not match to the ERP.

### 2. Count the bills in the ERP

The vendors that file e-invoices are exactly the portal counterparties that reconcile. For each one,
the robot signs in to the ERP, filters the vendor-bill worklist to that vendor and reads how many
bills it holds — one number per enrolled vendor.

### 3. Reconcile & report

Per vendor, the ERP bill count should equal the portal e-invoice count. Where the ERP holds more, a
bill was never filed — missing in the portal. Together with the portal-flagged drift and the
unmatched e-invoices, all three exception classes land in one CSV, ready to work.

## Running it

Ready to run as-is. It signs in with the published training credentials — the portal tax number
`FD-380417225` with a static one-time code, and the ERP user `HTANAKA` — which are not secret. Real
system credentials belong in the Robomotion Vault, never in a flow.
