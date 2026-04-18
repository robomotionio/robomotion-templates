# Get Metadata of a Web Page

Metadata describes the content of web pages and contains keywords linked to them. Robomotion enables you to retrieve these metadata and analyze or manipulate them according to your needs.

## What Get Metadata of a Web Page can do

- Navigates to a URL, reads its title and meta tags, and returns them as structured data. Useful for link previews or SEO audits.

## Behind the scenes

- The Power Automate flow description warns that the **Power Automate browser extension** is required. In Robomotion that extension is irrelevant — `Core.Browser.Open` + `Core.Browser.OpenLink` + `Core.Browser.RunScript` is self-sufficient, driving Chrome/Chromium via CDP. Drop the extension prerequisite when documenting.
- PA scopes each dialog title with the period `Get metadata of a webpage.` (trailing dot). Preserve.
- The subflow order in PA's main: Title → Keywords → Description → HTML_Source. Do not reorder — the "close browser" must run *after* all four.
