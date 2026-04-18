# Take Screenshot of a Web Page

Taking screenshots is a valuable ability in web flows, as users can store and share the current state of a web page. A typical scenario where screenshots are needed is logging. Robomotion provides a dedicated node to take screenshots of whole web pages or specific web elements.

## What Take Screenshot of a Web Page can do

- Input Dialog titled `Take screenshot of a website`, message `Please provide the website address to take screenshot of..`, default value `…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed != "Cancel"`; otherwise `Core.Flow.Stop`.
- Resolve Desktop path — Function node: `vDesktopPath = global.get('$Home$') + '/Desktop'`.
- Launch Edge — URL `vURL`, maximised, clear-cache `false`, clear-cookies `false`, timeout 60 → `vBrowser`. Catch → retry once after 2 s.
- Take Screenshot — save to `%vDesktopPath%\ScreenShot.png`, format `Png`.

## Behind the scenes

- Screenshot filename format `ScreenShot-yyyy-MM-dd@hh-mm.png`. The `@` between date and time is PA's separator convention — preserve exactly.
- The screenshot mode in PA is implicitly "visible area / full page" based on the browser's rendered state when maximised. Robomotion's `Core.Browser.Screenshot` has explicit page-vs-viewport flags — pick page-level to match the PA output most closely.
