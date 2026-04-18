# Open a Web Page

Before performing any other web tasks, you have to launch a browser window and load the appropriate web page. Robomotion allows you to launch instances of all popular browsers and load web pages on them.

## What Open a Web Page can do

- Input Dialog titled `Website address`, message `Please provide the website address to launch..`, default value `flow.microsoft.com`, sing…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Launch Edge — URL `vURL`, maximised, clear-cache `false`, clear-cookies `false`, timeout 60 → `vBrowser`. Wrap in a `Core.Trigger.Catch` …

## Behind the scenes

- No trailing close — PA leaves the browser on screen so the user sees the loaded page. Preserve this behaviour.
- PA's `flow.microsoft.com` default has no scheme; `LaunchEdge` prepends `https://` implicitly. Match that: if porting to `Core.Browser.OpenLink`, normalise the URL in a Function node first (prepend `https://` if missing).
