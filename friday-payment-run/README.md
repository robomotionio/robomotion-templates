# Friday Payment Run

Every week someone in accounts payable pays the bills that are due, then explains to their manager
which ones they held back and why. It is routine, it is repetitive, and it is exactly the kind of
thing that gets done at 5pm on a Friday when nobody is at their sharpest.

This flow prepares the run. It proposes every bill due within the next seven days, and — the part
that actually earns trust — it accounts for the bills it did **not** pay, each with the reason it is
on hold.

It runs against [RAP One](https://rapone.robomotion.online), a fictional SAP-style ERP used for
training. All data is synthetic.

## What it produces

`payment-run.csv` in your home folder, in two parts:

- **Proposed for payment** — the bills due within seven days, with the run total.
- **Excluded (blocked)** — the bills the run left out, each with its reason: a goods receipt not yet
  confirmed, a quantity or price mismatch against the purchase order, or a missing PO reference.

On the seeded ledger that is **4 bills proposed and 7 blocked**.

## How it works

### 1. Sign in

RAP One uses a SAP-style login: username, password and a client number. The session lives in memory
only, so after signing in the robot navigates by clicking the menu, never by reloading a URL — a
reload would drop it straight back to the login screen.

### 2. Build the proposal

On the payment run screen the robot narrows to bills due within seven days, selects them and creates
a proposal. Blocked bills never appear here — the ERP only offers payable ones — so the proposal is
clean by construction. Confirming the run posts a payment journal entry for each bill and flips it
to Paid.

In a real deployment this is where the human-approval gate goes: draft the proposal, email it for
sign-off, and only confirm once approved. This training version confirms it directly so you can see
the whole cycle.

### 3. Account for what was left out

The manager's first question is always *why wasn't this one paid?* So the robot opens the bills
list, filters to **Blocked**, and reads each held bill with its reason. Three of them are genuine
exceptions a buyer needs to resolve — a mismatched quantity, a mismatched price, a missing PO — and
the rest are simply waiting on a goods receipt.

## Running it

Ready to run as-is. It signs in with the published training credentials (`HTANAKA`, client `100`),
which are not secret. Real system credentials belong in the Robomotion Vault, never in a flow.
