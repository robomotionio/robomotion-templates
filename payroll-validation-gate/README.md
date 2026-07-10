# Payroll Validation Gate

Payroll is the one process where a robot that blindly does what it's told is dangerous. Post a run
with a bad row and you've either paid someone wrong or filed the cost against the wrong budget — and
either way, someone spends a week unwinding it. The valuable robot here is the one that **stops**.

This flow is that robot. It reads the draft payroll register, refuses to finalize when a row is
missing its cost centre, and confirms the total actually matches what left the bank — before anyone
posts anything.

It runs against [Workmonth](https://workmonth.robomotion.online), a fictional HR system used for
training. The data is entirely synthetic.

## What it produces

`payroll-check.csv` in your home folder: the register row count, any rows the gate stopped for,
whether the run is safe to finalize, and the net-total-versus-bank reconciliation. On the seeded
draft run that is 85 rows, **one row missing a cost centre**, finalize blocked, and a net total of
**€247,225.23 that matches the bank debit exactly**.

## How it works

### 1. Open the draft run

Sign in and open the payroll runs. The month still being worked is a Draft; completed months are
locked. The robot opens the draft to inspect its register.

### 2. Validate the register — the gate

It reads every row and finds the ones missing a cost centre. Payroll cannot be posted to the ledger
with an unclassified row, so the finalize button is blocked. The robot honours that gate and reports
the offending row rather than forcing the run through — this is the whole point.

### 3. Confirm the bank agrees

Then it reads the reconciliation panel: the register's net total against the salary debit in the
operating account. When one number matches across the HR system and the bank, the payroll is real,
not a spreadsheet error. The robot records that agreement.

### 4. Report

The report is what a payroll manager needs: the blocked row to fix, and the confirmation that the
money is right. Fix the cost centre, and the run is safe to post.

## Running it

Ready to run as-is. It signs in with the published training credentials
(`priya.sharma@globex.example`), which are not secret. Real system credentials belong in the
Robomotion Vault, never in a flow.
