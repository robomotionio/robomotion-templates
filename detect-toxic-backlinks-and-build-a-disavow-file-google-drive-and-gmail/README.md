# Toxic Backlink Disavow File

Pages through every backlink pointing at your domain with a spam score above the threshold, writes the source URLs into a Google-compliant disavow.txt, uploads it to Google Drive and emails you the link.

## How it works

1. **Run** — an Inject trigger; run it on demand, or give it a repeat interval.
2. **Set Parameters** — target domain, notification address, Drive folder, and the spam threshold (50 by default, which is DataForSEO's own toxic line).
3. **Get Spam Backlinks** → **Accumulate Page** → **Go To Next Page** — a `Label` / `GoTo` loop that walks `optOffset` 1000 at a time until `total_count` is exhausted, collecting `url_from` as it goes.
4. **Build Disavow File** — joins the URLs one per line and measures the UTF-8 byte length.
5. **Write disavow.txt** → **Upload To Drive** → **Send Disavow Link**.

## The two guards

Google rejects oversized disavow submissions, so the flow refuses to produce a file it knows will bounce and emails you the reason instead:

- more than **100,000** toxic links, or
- a finished file over **2 MB**.

Both paths land on the same *Compose Error Mail* → *Send Error Mail* branch and stop the flow with a `failed` status.

## Setup

- **DataForSEO credential** — API login and password from <https://app.dataforseo.com/api-access>.
- **Google Drive credential** — OAuth2 or Service Account, plus the destination folder ID (`root` for My Drive).
- **Gmail credential** — OAuth2 for the account that sends the notification.

## Before you upload

**Review the file.** Disavowing a good link costs you the equity it was passing, and the action is slow to reverse.

## Implementation note

The byte count is done by hand rather than with `Buffer.byteLength` — the Function node runs in a pure JS sandbox with no Node built-ins, so `Buffer` is unavailable.

## Ported from

- [Detect toxic backlinks and build a disavow file with DataForSEO, Google Drive, and Gmail](https://dataforseo.com/templates/detect-toxic-backlinks-and-build-a-disavow-file-with-dataforseo-google-drive-and-gmail-n8n/) — DataForSEO template
