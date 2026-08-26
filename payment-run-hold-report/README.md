# Payment Run with Hold Report

Every week someone in accounts payable pays the bills that are due, then explains to their manager
which ones they held back and why. It is routine, it is repetitive, and it gets done at 5pm on a
Friday when nobody is at their sharpest.

This flow does both halves. It proposes the bills due within the next seven days and confirms the
run, which posts a journal entry for each bill and marks it paid. Then — the part that actually
earns trust — it accounts for every bill it did **not** pay, each with the reason it is on hold.

It runs against [RAP One](https://rapone.robomotion.online), a fictional SAP-style ERP used for
training. All data is synthetic.

## What it produces

`payment-run.csv` in the `Reports` folder of your home directory, in two sections:

- **Bills proposed for payment** — the bills due within seven days, with the run total.
- **Bills excluded from payment** — the bills the run left out, each with its reason: a goods
  receipt not yet confirmed, a quantity or price mismatch against the purchase order, or a missing
  PO reference. The section ends with the total value held back.

A Log line closes the run with the counts, the run total and the value held back.

On the seeded ledger that is **4 bills proposed and 7 blocked**.

## How it works

### 1. Sign in from the Vault

RAP One uses a SAP-style login: username, password and a client number. The username and password
are read from a Vault item, so no credential is stored in the flow itself. The session lives in
memory only, so after signing in the robot navigates by clicking the menu, never by reloading a
URL — a reload would drop it straight back to the login screen.

### 2. Propose and confirm

On the payment run screen the robot narrows to bills due within seven days, selects them and creates
a proposal. Blocked bills never appear here — the ERP only offers payable ones — so the proposal is
clean by construction. Confirming the run posts a payment journal entry for each bill and flips it
to Paid.

The run does not take the confirmation on faith. A verify step re-reads the posted summary and
raises if the document count or the total does not match the proposal it just approved.

In a real deployment this is where the human-approval gate goes: draft the proposal, email it for
sign-off, and only confirm once approved. This training version confirms it directly so you can see
the whole cycle.

### 3. Account for what was left out

The manager's first question is always *why wasn't this one paid?* So the robot opens the bills
list, filters to **Blocked**, and reads each held bill with its reason. Three of them are genuine
exceptions a buyer needs to resolve — a mismatched quantity, a mismatched price, a missing PO — and
the rest are simply waiting on a goods receipt. If the blocked list ever spans more than one page
the flow raises rather than silently reporting a partial picture.

### 4. Report

The `Reports` folder is created only if it is missing, then the CSV is written and the summary
logged. The proposal is the week's payment run; the blocked list is the exceptions to chase.

## Running it

Before the first run, create a Vault item holding the RAP One username and password, and point the
`Get RAP One Credentials` node at it. The flow reads `username` and `password` from that item and
types the client number (`100`) itself.

The published training account is `HTANAKA` / client `100`, which is not secret — but it goes in the
Vault here rather than in a Function node, which is where real system credentials belong.
