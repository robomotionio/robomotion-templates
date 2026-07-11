# Logistics Exception Center

A stuck shipment shows up in more than one place. The carrier flags it as an exception, the customer
gets an automated e-mail, and sooner or later someone opens a help-desk ticket. Handle them
system-by-system and you either miss one or work the same one twice. The valuable robot pulls all
three together into a single worklist and marks, for every exception, what has already happened to
it — so the team works the gap, not the duplicates.

This flow builds that command center. It reads the carrier's active exceptions, then dedupes them
against the mailbox and the help desk on the tracking number.

It spans three fictional training systems — [SlugExpress](https://slugexpress.robomotion.online) (the
carrier), [Lookout Mail](https://lookout.robomotion.online) and
[Grumpdesk](https://grumpdesk.robomotion.online) (the help desk) — whose data is entirely synthetic.

## What it produces

`logistics-exceptions.csv` in your home folder: every active exception with its consignee,
destination and status, and — joined on the tracking number — whether it was mailed and whether a
ticket already exists, with an action of `has ticket` or `NEEDS TICKET`. On the seeded data that is
**30 active exceptions, 6 already mailed, 2 already ticketed, and 28 that still need a ticket**.

## How it works

### 1. The carrier's exception worklist

Sign in to the carrier portal and open the exception worklist — every shipment on customs hold,
failed delivery or delay. Read the tracking number, consignee, destination and status for each. This
is the master list everything else is checked against.

### 2. Who already knows

Two more systems hold part of the story. The mailbox received delivery-exception notifications — the
robot reads which tracking numbers were mailed. The help desk may already have a ticket — it filters
to the escalated (customs-hold) tickets and reads the tracking number each is linked to. Each is an
independent source, joined back on the tracking number.

### 3. Dedupe & report

For every exception the robot marks whether it was mailed and whether a ticket already exists. The
ones with no ticket are the real work — flagged `NEEDS TICKET` — while the ones already in the help
desk are left alone. All of it lands in one CSV.

## Running it

Ready to run as-is. It signs in with the published training credentials
(`svc.rpa@slugexpress.example`, `hiroshi.tanaka@globex.example`, `svc.rpa@grumpdesk.example`), which
are not secret. Real system credentials belong in the Robomotion Vault, never in a flow.
