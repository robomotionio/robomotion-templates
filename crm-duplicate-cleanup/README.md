# CRM Duplicate Cleanup

Every CRM rots the same way: the same customer gets entered twice. Bob Smith and Robert Smith. One
with a phone number, one with a company. Sales works off whichever they happened to open, deals get
double-counted, and nobody has an afternoon spare to sit and merge them by hand.

This flow does the merging. It finds the duplicate pairs the CRM has already grouped, and merges
each one into a single clean record — the tedious housekeeping that never makes it to the top of
anyone's list.

It runs against [Zapspot](https://zapspot.robomotion.online), a fictional CRM used for training. The
data is entirely synthetic.

## What it produces

`crm-cleanup.csv` in your home folder — the before-and-after: how many duplicate pairs were merged
and how many remain. On the seeded CRM that is **12 pairs merged, 0 left**.

## How it works

### 1. Open the duplicates view

Sign in and switch the contact list to its duplicates view. The CRM has already grouped the likely
duplicate pairs — same person, name variants — so the robot doesn't have to guess who is who; it
works through the pairs the CRM surfaces.

### 2. Merge every pair

Merging a pair removes it from the list, which would break a fixed loop counter. So instead the
robot keeps merging the **first remaining** pair and re-checks, until there are none left. Each merge
opens the side-by-side picker and confirms, keeping the primary record and folding the variant into
it.

This loop-until-empty shape is worth remembering for any "work the list until it's clear" job where
acting on an item removes it.

### 3. Report

The report is the proof: pairs merged, pairs remaining. Run it overnight and the CRM is clean by
morning.

## Running it

Ready to run as-is. It signs in with the published training credentials
(`jonas.weber@globex.example`), which are not secret. Real system credentials belong in the
Robomotion Vault, never in a flow.
