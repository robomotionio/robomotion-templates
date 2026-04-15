# Get Metadata of a Web Page

**Level:** Intermediate

## Description
Metadata describes the content of web pages and contains keywords linked to them. Robomotion enables you to retrieve these metadata and analyze or manipulate them according to your needs.

## Objective
Navigate to a web page and extract its metadata — `<title>`, `<meta name="description">`, Open Graph tags, canonical URL, and `<meta name="keywords">` — into a single structured object, then write the result to a JSON file.

## Prerequisites
- Robomotion Browser package
- Target URL with rich metadata (e.g. a blog post or a product page)

## Steps
1. **Open Browser** → `vBrowser`.
2. **Navigate** to the target URL.
3. Build `vMetadata` as an empty object (Flow scope).
4. **Get Text** — read `document.title` → `vMetadata.title`.
5. **Get Attribute** nodes on `<meta>` selectors:
   - `meta[name="description"]` → `content` → `vMetadata.description`
   - `meta[name="keywords"]` → `content` → `vMetadata.keywords`
   - `link[rel="canonical"]` → `href` → `vMetadata.canonical`
   - `meta[property^="og:"]` — iterate, collecting into `vMetadata.og`
   - `meta[name^="twitter:"]` — iterate, collecting into `vMetadata.twitter`
6. **Log Message** — pretty-print `vMetadata`.
7. **Write To File** — save `vMetadata` as `metadata.json`.
8. **Close Browser**.

## Expected Outcome
`metadata.json` contains a structured snapshot of the page's SEO metadata, usable by downstream analysis flows.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vBrowser` | Message | Browser session |
| `vMetadata` | Flow | Accumulated metadata object |
| `vTags` | Message | Iteration buffer for OG/Twitter tags |

## Notes
- The intermediate bump over the Beginner tutorials comes from: (a) iterating over matched element sets, and (b) composing a nested object in variable scope.
- Good follow-up exercise: compare metadata of two URLs to flag SEO regressions.
