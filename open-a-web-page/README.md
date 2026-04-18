# Open a Web Page

Before performing any other web tasks, you have to launch a browser window and load the appropriate web page. Robomotion allows you to launch instances of all popular browsers and load web pages on them.

## What Open a Web Page can do

- Input Dialog titled `Website address`, message `Please provide the website address to launch..`, default `robomotion.io` → `msg.url_input`.
- Normalise input (`Core.Programming.Function`, `outputs: 2`) — cancel short-circuits to `Core.Flow.Stop`; otherwise trim, prepend `https://` if missing, store as `msg.url`, initialise `msg.retry_count = 0`.
- Launch browser (`Core.Browser.Open`, `chrome`, maximised) → `msg.browser_id`, then open the URL (`Core.Browser.OpenLink`, timeout 60) → `msg.page_id`.
- `Core.Trigger.Catch` around the launch/open pair — increments `msg.retry_count`, sleeps 2s, and `Core.Flow.GoTo` back to the retry label; after one retry it stops with `failed`.

## Behind the scenes

- No trailing close — the browser stays on screen so the user sees the loaded page.
- The default `robomotion.io` has no scheme; the normalisation Function prepends `https://` before `Core.Browser.OpenLink` runs, so users can type bare hostnames.
