# Vendor Onboarding

Onboarding a new supplier is dull, and dull is where mistakes hide. Someone in procurement e-mails
the details, someone in finance re-keys them into the ERP, and a single transposed digit in the IBAN
means the first payment bounces — or worse, pays a stranger. The valuable robot here does the
re-keying without the typos, and lets the ERP's own checksum catch a bad account number before it
becomes a payable.

This flow reads the onboarding request out of the mailbox, opens a new vendor in the ERP, fills all
three tabs from the request and the attached packet, and saves. The IBAN is run through a mod-97
checksum on the way in; a valid number is accepted, a bad one is refused.

It spans two fictional training systems — [Lookout Mail](https://lookout.robomotion.online) for the
request and [RAP One](https://rapone.robomotion.online) for the vendor master — whose data is
entirely synthetic.

## What it produces

`vendor-onboarding.csv` in your home folder: the vendor as it was created — name, the ERP's new
vendor ID, category, terms, tax ID, IBAN, the checksum result and the saved status line. On the
seeded request that is **Fjordline Data GmbH**, hosting, Net 14, created as a fresh `V-####` vendor
with its **IBAN passing the mod-97 check**.

## How it works

### 1. Read the onboarding request

Sign in to the mailbox and open the "new vendor onboarding" e-mail. The vendor name, category and
payment terms are read straight out of the request body. The bank and tax details travel in the
attached onboarding packet; the flow carries them as the vetted values to key in.

### 2. Create the vendor in the ERP

Sign in to RAP One and open a new vendor. The robot fills the three tabs the way a clerk would —
General (name, category, terms, reconciliation account), Payment (tax ID and IBAN) and Contact
(billing e-mail) — then saves. As it enters the IBAN, the ERP runs it through a mod-97 checksum and
shows the result live; a failed checksum blocks the save entirely, so a vendor that saves is a vendor
whose bank details are structurally sound.

### 3. Confirm & report

The robot reads back the created record — its new vendor ID, the saved status line and the checksum
result — and writes it to a CSV. The change to the vendor master is now auditable, and the supplier
is live and payable in the ERP.

## Running it

Ready to run as-is. It signs in with the published training credentials
(`hiroshi.tanaka@globex.example` for the mailbox, `HTANAKA` for the ERP), which are not secret. Real
system credentials belong in the Robomotion Vault, never in a flow.
