# Template Level Field

Every `template.yaml` (and each entry in `index.yaml`) must declare a `level:` field that signals the expected difficulty for a user picking up the template.

## Allowed values

| Value | When to use |
|---|---|
| `Beginner` | Short linear flow (≤ ~8 nodes), no subflows, no external integrations. Demonstrates a single feature. |
| `Intermediate` | Branching, loops, subflows, or moderate logic. No AI / external SaaS. |
| `Advanced` | AI agents, multi-package integrations, parallelism, or external systems (Google Sheets, LLMs, etc.). |

## Required

The `level:` field is required on every template and every `index.yaml` entry.
`schema_version` stays `1` — the field is additive but authored everywhere.

## Example

```yaml
name: BMI Calculator
slug: bmi-calculator
level: Beginner
...
```
