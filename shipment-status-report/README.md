# Shipment Status Report

Somebody opens the carrier portal every morning to find the shipments that are stuck. The list runs
to hundreds of rows across a dozen pages, and the answer they actually need is the short list at the
end: which ones need a person today, oldest first, and how much money is sitting in them.

This flow does the whole sweep and then writes that short list.

It runs against [SlugExpress](https://slugexpress.robomotion.online), a fictional carrier portal used
for training. All data is synthetic.

## What it produces

Two files in the `Reports` folder of your home directory:

- **`shipment-report.csv`** — every shipment on every page, exactly as the portal lists it.
- **`shipment-exceptions.csv`** — only the shipments with a status worth chasing (Customs Hold,
  Failed Delivery, Delayed), sorted oldest booking first, with the billed amount as a number so the
  column can be summed or sorted in a spreadsheet.

A Log line closes the run with the shipment count, the exception count and the billed value held up
in them.

## How it works

### 1. Sign in

The portal login is a plain email and password form, and both are read from a Vault item rather than
stored in the flow. After signing in the robot opens the Shipments list from the portal navigation
and waits for the first row to render before it reads anything.

### 2. Sweep every page

A `Label` and a `GoTo` make the page loop. Each turn runs one script that extracts the rows of the
current page *and* the pager state in a single pass, so the flow always knows whether another page is
waiting without a second round trip.

The `Collect Page` function has two outputs: one continues the loop, the other leaves it. When the
Next control is disabled — or the page count is reached — the sweep is done and the flow exits
through the second output.

Two details worth copying into your own scrapers:

- **The Next click is scripted, not hit-tested.** The portal's fixed demo-controls widget overlaps
  the pager, so a real click can be swallowed by it. Calling `.click()` in the page bypasses that.
- **The wait after the click is for the *next* page indicator specifically**, built as an XPath
  naming the page number it expects. Waiting for "a table row" would pass instantly against the page
  it just left.

### 3. The exceptions

The full sweep is written first, so nothing is lost if the narrowing logic changes later. Then the
rows are filtered to the three watched statuses, the billed euro string is parsed back into a number,
and the result is sorted by booking date — keyed as `yyyy-mm-dd` so a plain string compare puts the
oldest first.

### 4. Close out

The summary is logged, the browser closes, and the flow stops.

## Running it

Before the first run, create a Vault item holding the portal email and password, and point the
`Get Portal Credentials` node at it. The flow reads `username` and `password` from that item.

## Related

[Bulk Shipment Tracking Sweep](../bulk-shipment-tracking-sweep) solves a neighbouring problem the
opposite way: no login, a fixed list of tracking numbers, and eight parallel workers pulling from a
shared queue. Reach for that one when the work is a known list and throughput matters; reach for this
one when you have to sign in and walk a paginated list you do not know the length of.
