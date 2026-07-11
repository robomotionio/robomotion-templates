# E-Invoice Portal Harvest

In a lot of the world, somebody spends the first morning of every month downloading e-invoices from
a government portal, one at a time. Log in, wait for the code, search the period, open an invoice,
confirm the dialog, tick the box that says you are not a robot, save the XML, save the PDF, go back,
next one. Ninety-six times.

This flow does it in about three minutes, and the portal never notices.

It runs against [FRS](https://frs.robomotion.online), the fictional Freedonia Revenue Service used
for training. The data is entirely synthetic.

## What it produces

- `einvoice-index.csv` in your home folder — one row per invoice: document id, direction,
  counterparty and their tax id, issue date, gross, status, any exception the portal flagged, and
  the **ETTN** (the government's unique reference for the document).
- Every invoice's **XML and PDF**, in a download directory under your temp folder. For the seeded
  register that is 96 invoices and 192 files.

A representative run:

```
Register page 1/10 - 10 rows so far
...
Harvesting 96 of 96 invoices across 10 pages
Harvested 96 invoices (62 received, 34 issued) in 187s
The portal flagged 3: FRS-2026-004001 Amount drift; FRS-2026-004417 Not found in ERP; FRS-2026-004432 Not found in ERP
Downloaded 192 files
```

## How it works

### 1. Two-factor sign in

Tax number and password, then a one-time code on a second screen. The browser is opened with a
download directory so the files the portal hands over land somewhere the robot can find them.

Note the `Make Download Dir` node: like `optUserDataDir`, **`Core.Browser.Open` does not create
`optDownloadDir`**. Something has to make it first.

The flow then waits for the dashboard before navigating anywhere. The session is written to
`localStorage` as the post-login redirect happens; navigate before that and the portal bounces the
robot back to the login screen.

### 2. Walk the result pages

The register pages ten records at a time. The robot scrapes a page, reads the pager to learn whether
a next page exists, clicks **Next**, and goes round again. It stops when the Next button reports
itself disabled — not after counting to a number somebody typed into the flow.

The pager also reports how many records it holds in total. The flow checks its scraped row count
against that number and fails loudly if they disagree, so a silently missed page is an error rather
than a shorter spreadsheet.

### 3. Harvest each invoice

Nothing in this flow changes the portal, so the robot jumps straight to each document by URL rather
than clicking back and forth. The ETTN is shown only on the detail page, which is why every invoice
has to be opened at all.

### 4. Two downloads, four clicks each

Click the button, wait for the dialog, tick **I am not a robot**, accept. Then the same four clicks
again for the other format. The accept button stays disabled until the box is ticked, so the fact
that the click lands at all is proof the tick registered.

The register's rows stack two values in one cell — the counterparty's name over its tax id, and on
some rows an exception chip under the status. Both are split into their own columns. A newline left
inside a CSV field would quietly turn one row into two.

### 5. Index what was collected

The index joins what the register listed with what only the detail page knows.

## Running it

Ready to run as-is. It signs in with the published training credentials (`FD-380417225`), which are
not secret, and a static one-time code.

`?chaos=toast-kill` on the URLs turns off the portal's toast notifications for the session. Each
download raises one, and a toast is a fixed overlay: a real mouse click that lands on it is
swallowed silently — the click node reports success and nothing happens. Real portals will not hand
you a flag like that, so on one you would wait for the overlay to clear or click through the DOM.

To try the mechanics without waiting for all 96, set `msg.limit` in the **Setup** node to a small
number. `0` means the whole register.
