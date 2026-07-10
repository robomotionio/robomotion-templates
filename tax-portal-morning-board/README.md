# Tax Portal Morning Board

An accountant who manages a dozen companies' tax compliance starts every morning the same way:
log into the portal, switch to each client, check for new penalties, unread notices and looming
deadlines, then switch to the next. Twelve times. Before the first coffee.

This flow does that sweep and hands back a single status board — every client on one page, the ones
that need attention at the top.

It runs against [FRS](https://frs.robomotion.online), a fictional government tax portal used for
training. The data is entirely synthetic.

## What it produces

`tax-status-board.csv` in your home folder — one row per client, sorted worst first: its status,
unread notices, open penalties, deadline count, and a short reason for any that need attention. On
the seeded set of twelve mandates, three surface: two clients with penalties from late filings, and
one with an audit request carrying a hard deadline.

## How it works

### 1. Sign in as the representative

Log in as the authorised representative with two-factor. A representative acting for many companies
lands on a mandate picker rather than a single dashboard — the portal needs to know which client you
are acting for.

### 2. List the mandates

The robot reads every mandate the representative holds — client name and tax id — and turns them into
a work queue: one pass per company.

### 3. Check each client

For each mandate it switches the active company through the mandate switcher and opens that
company's dashboard, reading the unread-notice count, the open-penalty count and the deadlines. A
company with penalties, an audit request or a late filing is marked for attention; the rest are
clear.

Two things worth knowing if you adapt this. Each switch raises a "now acting for …" toast, and over
a dozen clients those overlays pile up over the menu — the flow disables them with the portal's
`toast-kill` flag. And activating a mandate only sets the active company; the flow then opens the
dashboard explicitly to read it.

### 4. Build the board

The board is sorted with the attention cases first, so the human opens it and immediately sees the
three clients that need them — not the nine that don't.

## Running it

Ready to run as-is. It signs in with the published training credentials (`FD-772103944`, with a
static one-time code), which are not secret. Real system credentials belong in the Robomotion Vault,
never in a flow.
