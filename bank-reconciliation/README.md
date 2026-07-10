# Bank Reconciliation

The ledger says a bill was paid. The bank is where you find out whether it actually was — at the
right amount, once, and only when it should have been. Reconciliation is the control that catches the
gap between the two, and it is exactly the kind of patient, evidence-gathering work a robot does
better than a person at month-end: for every item in question, pull the statement, read what settled,
and put a number on the discrepancy.

This flow does that. It takes the payments and receipts the ERP could not tie out and confirms each
against the operating account, classifying the four ways money and ledger drift apart.

It spans two fictional training systems — [RAP One](https://rapone.robomotion.online), the ERP, and
[AcmeBank](https://acmebank.robomotion.online), the bank — whose data is entirely synthetic and
reconciles to the cent.

## What it produces

`bank-reconciliation.csv` in your home folder: every flagged item with its verdict and the exact
figures from both sides. On the seeded data that is **five confirmed discrepancies**:

- **Missing payment** — `NW-2026-0442` is Paid in the ledger but no debit left the bank; €4,998
  outstanding.
- **Transposition** — `HE-2026-06-4471` settled at €1,824.33 against a ledger amount of €1,842.33 (a
  transposed digit, €18.00 out).
- **Double payment** — `VF-2026-06-8801` was paid twice: two debits of €489.90.
- **Unapplied cash** — `INV-2026-0641` (€8,901.20) and `INV-2026-0655` (€6,330.80) were received in
  the bank but the invoices are still open in the ledger.

## How it works

### 1. Pull the ledger's open questions

Sign in to the ERP. Its exceptions worklist already flags the paid bills it could not tie out, and
the customer invoices where cash is expected but the item is still open. The robot reads the
reference and amount for each — the items to prove against the bank.

### 2. Prove each against the bank

Two-factor sign in to the bank and open the operating account. For every flagged item, search the
statement by its reference and read what actually settled — no debit, a debit at the wrong amount,
two debits, or a credit that arrived. The bank statement is the independent record; the count and
amount decide the verdict.

### 3. Classify & report

Zero debits is a missing payment; one debit at the wrong amount is a transposition; two debits is a
double payment; a credit against a still-open invoice is unapplied cash. Each verdict carries the
figures from both sides, written to a CSV a finance team can action.

## Running it

Ready to run as-is. It signs in with the published training credentials (`HTANAKA` for the ERP,
`hiroshi.tanaka@globex.example` with a static one-time code for the bank), which are not secret. Real
system credentials belong in the Robomotion Vault, never in a flow.
