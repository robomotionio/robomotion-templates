# Extract Phone Numbers and Emails from Text

**Level:** Intermediate

## Description
Extracting specific data from documents can be challenging, as the targeted information may appear multiple times and in different formats throughout the text. Robomotion enables users to easily extract various text entities in natural language, such as emails, phone numbers, dates, currencies and measurement units.

## Objective
Given an unstructured block of text (e.g. a support ticket body or a scraped web page), extract every email address and phone number into deduplicated lists, ready for downstream CRM entry.

## Prerequisites
- Robomotion Text package
- Sample input file `./samples/ticket.txt`

## Steps
1. **Read File** → `vText`.
2. **Extract Entities** (email) — run an email regex (`[\w\.-]+@[\w\.-]+\.\w+`) against `vText` → `vEmails` (array).
3. **Extract Entities** (phone) — run a phone regex that captures common formats:
   - `\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}`
   → `vPhones`.
4. **Deduplicate** (lowercase emails first) → `vEmailsUnique`, `vPhonesUnique`.
5. **Write CSV** — `./out/contacts.csv` with columns `type, value`.
6. **Log Message** — `Found {vEmailsUnique.length} emails, {vPhonesUnique.length} phones`.

### Test fixtures
| Input snippet | Expected catch |
|---|---|
| `Mail us at hello@example.com or HELLO@Example.com` | 1 email (deduped) |
| `Call +1 (415) 555-0132 or 415.555.0132` | 2 entries pre-dedup, 1 post if you normalize |
| `See http://foo@bar.com/path` (not an email) | skip |

## Expected Outcome
`contacts.csv` lists every unique email and phone number found, correctly ignoring URL-embedded `@` signs and deduplicating case variants.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vText` | Message | Input text |
| `vEmails` / `vPhones` | Message | Raw matches |
| `vEmailsUnique` / `vPhonesUnique` | Flow | Deduped results |

## Notes
- Phone numbers are locale-dependent — a single regex will never be perfect; teach the "catch lots, filter precisely" pattern.
- Mention PII/GDPR responsibilities before extracting real contact data.
