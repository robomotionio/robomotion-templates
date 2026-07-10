# Refund Request Triage

A customer writes in: *"you charged me twice, refund the duplicate."* Sometimes that is true.
Sometimes it isn't. A support agent who just refunds everyone loses money; one who refuses everyone
loses customers. The right move is to check the bank — and that is exactly the swivel-chair work
nobody enjoys: helpdesk in one window, banking in another, matching references by eye.

This flow does the checking. It reads each refund request, looks the disputed charge up in the
actual bank account, and decides: genuine duplicate, or a single charge the customer misread. It
approves the real ones and escalates the rest to a human — with the evidence attached, never an
automatic denial.

It runs against two fictional training sites: [Grumpdesk](https://grumpdesk.robomotion.online) (the
helpdesk) and [AcmeBank](https://acmebank.robomotion.online) (the bank). All data is synthetic.

## What it produces

`refund-decisions.csv` in your home folder — one row per ticket: the customer, the disputed bank
reference, how many charges the bank actually held under it, the decision, and the action taken. On
the seeded queue that comes out to **5 approved and 3 escalated**.

## How it works

### 1. Scan the bank first

One trip to AcmeBank: sign in through two-factor, open the Globex operating account, and pull every
shipment charge in a single search. Grouping them by reference gives a map of how many times each
charge appears — two or more under one reference is a genuine duplicate, one is a single charge.

Doing this once, up front, means the robot never has to swivel back to the bank per ticket. It
verifies eight tickets against one scan.

### 2. Read the refund queue

Sign in to Grumpdesk and open the **All** view — the refund tickets are assigned to agents, so they
are not in the default Unassigned view. Filtering by the `refund` tag narrows the list to the
requests that need a decision.

### 3. Decide each ticket against the bank

For each ticket the robot reads the bank reference the customer is disputing — the one piece of
input a human would copy across — and looks it up in the map built from AcmeBank. Two or more
charges: duplicate. One: not a duplicate.

The robot forms its **own** verdict from the bank record. The helpdesk happens to display its own
guess, but the flow ignores that and trusts the bank. As a safety rail, Grumpdesk only enables its
**Approve** button when it agrees a duplicate exists, so the robot's decision and the button always
line up — if they ever disagreed, the approve click would simply fail rather than pay out wrongly.

### 4. Approve or escalate

Genuine duplicate: apply the refund-approved macro and solve the ticket. Not a duplicate: leave an
internal note with the evidence — *one charge under this reference, no duplicate found* — and
escalate to a human with the priority raised.

This is the point of the whole thing. The robot disagrees with three customers, politely, with the
bank record to back it up, and hands those three to a person instead of auto-denying them.

## Running it

Ready to run as-is. It signs in with the published training credentials for the two demo sites
(`svc.rpa@grumpdesk.example` and `hiroshi.tanaka@globex.example`, with the static two-factor code),
which are not secret. Real system credentials belong in the Robomotion Vault, never in a flow.

A couple of things worth knowing if you adapt this:

- **AcmeBank's session is not persisted**, so after two-factor the flow navigates client-side
  (dashboard → account → transactions) rather than by URL; a full reload would drop it back to the
  login screen. Grumpdesk *does* persist its session, so the ticket loop navigates by URL freely.
- The bank is scanned **once** and the tickets are decided from that map. On a real bank with far
  more than a page of charges you would search per reference instead.
