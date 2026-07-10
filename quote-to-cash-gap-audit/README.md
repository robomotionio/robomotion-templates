# Quote-to-Cash Gap Audit

The most expensive mistake in a growing company is quiet: a deal closes, everyone celebrates, and
nobody sends the invoice. The work was done, the customer is happy, and the money never arrives —
because the step between "won" and "billed" fell through a crack nobody was watching.

This flow watches that crack. It reads the deal board, finds the won deals that were never invoiced,
and tells you exactly how much money is sitting there uncollected.

It runs against [Zapspot](https://zapspot.robomotion.online), a fictional CRM used for training. The
data is entirely synthetic.

## What it produces

`billing-gaps.csv` in your home folder — every won-but-unbilled deal with its customer and amount,
and a grand total. On the seeded board that is three deals worth **€37,400** nobody billed.

## How it works

### 1. Open the deal board

Sign in and open the deals kanban. Each card shows the deal's value, and the CRM chips a card
**unbilled** when the deal is closed-won but has no invoice behind it.

### 2. Find the unbilled wins

The robot reads every card on the board and keeps only the ones flagged unbilled — a won deal
finance never turned into money owed. Each one is revenue the company earned and forgot to ask for.

### 3. Total the recovery

It adds them up and writes the list finance needs — which customer, which deal, how much — with the
grand total at the bottom. That list is the whole point: hand it over and the invoices get raised.

## Running it

Ready to run as-is. It signs in with the published training credentials
(`jonas.weber@globex.example`), which are not secret. Real system credentials belong in the
Robomotion Vault, never in a flow.
