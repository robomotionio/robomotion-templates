# Get Metadata of a Web Page

Metadata describes the content of web pages and contains keywords linked to them. Robomotion enables you to retrieve these metadata and analyze or manipulate them according to your needs.

## What Get Metadata of a Web Page can do

- Input Dialog titled `Get metadata of a web page`, default `robomotion.io` → `msg.url_input`.
- Normalise input (`Core.Programming.Function`, `outputs: 2`) — cancel short-circuits to `Core.Flow.Stop`; otherwise trim, prepend `https://` if missing, store as `msg.url`.
- Launch browser (`Core.Browser.Open`, `chrome`, maximised) → `msg.browser_id`, then open the URL (`Core.Browser.OpenLink`, timeout 60) → `msg.page_id`.
- Run four subflows in order — Show Title, Show Keywords, Show Description, Show HTML Source — each reads a piece of metadata via `Core.Browser.RunScript` and surfaces it in a dialog.
- Close the browser (`Core.Browser.Close`) before stopping.

## Behind the scenes

- `Core.Browser.Open` + `Core.Browser.OpenLink` + `Core.Browser.RunScript` drives Chrome/Chromium directly via CDP — no browser extension is needed.
- Subflow order matters: Title → Keywords → Description → HTML Source, all before `Core.Browser.Close`. Reordering the close ahead of any reader would leave the script without a page to query.
