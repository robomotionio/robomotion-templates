# Use the OR Operator in Conditionals

**Level:** Intermediate

## Description
Logical operators enable users to create complex logical expressions and implement advanced logic in their flows. For example, they can use the "OR" logical operator to create expressions that are true when at least one of the provided conditions is valid.

## Objective
Route an incoming support ticket to the on-call queue when **any** of these is true: the subject contains "urgent", the sender is on the VIP list, or the creation hour is outside business hours (9–17 local).

## Prerequisites
- Robomotion Text + DateTime packages
- VIP list `./config/vips.json`
- Sample ticket payload (Flow variable `vTicket`)

## Steps
1. Load `vVips` from `./config/vips.json` once (Flow).
2. Given `vTicket = { subject, sender, createdAt }`:
   - `vSubjectUrgent = contains(toLower(vTicket.subject), "urgent")`.
   - `vSenderVip = vTicket.sender in vVips`.
   - **Parse Date** `vTicket.createdAt` → `vCreated`.
   - `vOutsideHours = vCreated.Hour < 9 || vCreated.Hour >= 17`.
3. **If** `vSubjectUrgent || vSenderVip || vOutsideHours`:
   - **Log Message** — `ROUTE-ONCALL: {reason list}`.
   - (Integration step: POST to on-call webhook.)
4. **Else**:
   - **Log Message** — `ROUTE-STANDARD`.

## Expected Outcome
Tickets satisfying any one of the three predicates are routed to on-call; the log records which predicate(s) triggered the escalation.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vVips` | Flow | VIP allow-list |
| `vTicket` | Message | Incoming ticket |
| `vSubjectUrgent` / `vSenderVip` / `vOutsideHours` | Message | Predicates |

## Notes
- Mirror image of the AND tutorial — best taught back-to-back.
- Point out that when multiple predicates are true, logging *all* of them (not just the first) is more useful for post-incident review.
