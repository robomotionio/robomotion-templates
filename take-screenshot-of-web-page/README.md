# Take Screenshot of a Web Page

Taking screenshots is a valuable ability in web flows, as users can store and share the current state of a web page. A typical scenario where screenshots are needed is logging. Robomotion provides a dedicated node to take screenshots of whole web pages or specific web elements.

## What Take Screenshot of a Web Page can do

- Input Dialog titled `Take screenshot of a website`, message `Please provide the website address to take screenshot of..`, default `robomotion.io` -> `msg.url_input`.
- Normalise input (`Core.Programming.Function`, `outputs: 2`) — cancel short-circuits to `Core.Flow.Stop`; otherwise trim, prepend `https://` if missing, store as `msg.url`.
- Build paths (`Core.Programming.Function`) — `msg.desktop_path = global.get('$Home$') + '\Desktop'`, `msg.screenshot_path = msg.desktop_path + '\ScreenShot.png'`, initialise `msg.retry_count = 0`.
- Launch browser (`Core.Browser.Open`, `chrome`, maximised) -> `msg.browser_id`, open the URL (`Core.Browser.OpenLink`, timeout 60) -> `msg.page_id`.
- Take screenshot (`Core.Browser.Screenshot`) saving to `msg.screenshot_path`, then `Core.Browser.Close` on `msg.browser_id`.
- Timestamp via `Robomotion.DateTime.Now` (`RFC3339`, Local) -> `msg.now`, formatted (`Robomotion.DateTime.Format`, layout `2006-01-02@03-04`) -> `msg.stamp`.
- Rename (`Core.FileSystem.Move`, `continueOnError: true`) to `msg.renamed_path = msg.desktop_path + '\ScreenShot-' + msg.stamp + '.png'`, then `Core.Dialog.MessageBox` titled `Screenshot taken!` showing `msg.dialog_text`.
- `Core.Trigger.Catch` around the launch/open pair — increments `msg.retry_count`, sleeps 2s, and `Core.Flow.GoTo` back to the retry label; after one retry it stops with `failed`.

## Behind the scenes

- Screenshot filename format `ScreenShot-yyyy-MM-dd@hh-mm.png` — the `@` between date and time is deliberate so timestamps sort cleanly without colliding with filesystem separators.
- `Core.Browser.Screenshot` captures the rendered page via the `page_id`, so the maximised browser window determines the viewport before the shot is taken.
