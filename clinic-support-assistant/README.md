# Clinic Support Assistant

Clinic Support Assistant answers questions on a company's website: from the public documents for anyone who turns up, and from the customer's own record once they have signed in. It is worked here as a family practice, but the shape is any support desk.

The whole assistant is served to the page as **one MCP tool**. The bridge in front of it holds no model, no prompt and no tool list, so what the assistant is allowed to do is this canvas and nothing else.

The part worth copying is the **fork**. A visitor and a signed-in patient are answered by two different Hermes Agents, and the difference between them is not a prompt or a flag, it is two wires. The visitor's agent is wired to the practice documents and to nothing else, so there is no tool on that side of the canvas that could read a patient's record, whatever the model is asked to do.

## What Clinic Support Assistant can do

- Answer a stranger's question from your own documents, and say so plainly when they do not cover it
- Answer a signed-in customer's question about their own appointment and account
- Keep the two apart by wiring rather than by instructions, so a prompt injection has nothing to reach for
- Hold a conversation per session, and a separate one for a signed-in customer on a shared computer
- Write every turn to a dialog log: the question, the answer, which tools ran, and how long it took

## Behind the scenes

**Listen HTTP** makes the flow a stateless MCP server on `127.0.0.1:8080/mcp`, guarded by a bearer token from the Vault. One **Tool In** declares `ask_harborview` with three arguments: the question, a session id, and a `patient_id` that only the website may set.

**Read The Question** takes them off the message and does the one check that matters: a record number is accepted only if it looks like one, and the conversation id is bound to the patient so a shared computer cannot inherit the last person's thread. **Is This A Patient** is an ordinary Switch, and its two ports are the fence.

Each branch is a **Hermes Agent** with its own system prompt. Both are wired to the same **Knowledge Base Toolkit**, because what a visitor may read and what a patient may read are the same pages of the same website. Only the patient's agent is also wired to **My Appointments** and **My Account**.

Those two tools declare **no arguments at all**. Their JSON schema is an empty `properties` object, and the SQL behind them reads `{{{patient_id}}}` off the message the agent was called with. A tool that cannot be told who to look up cannot be talked into looking up somebody else.

Both agents' ordinary output goes to **Log The Turn**, which works out which tools actually ran by reading the agent's own message history, drops anything that branch was never given, escapes the text for SQL, and hands the answer back through **Tool Out**.

## Setup Guide

1. **Vault:** create an *API Key* item with your OpenRouter key and select it under **API Key** in both agent nodes. Create a second item holding a bearer token of your own invention and select it under **Token** in **Serve The Assistant**. Your website sends that token; nothing else may call the tool.
2. **Knowledge base:** create one called `Harborview Practice` and index the pages a visitor is allowed to read. If yours has another name, change it in **Practice Documents**.
3. **Database:** the two signed-in tools read `~/harborview/harborview.db`. Create it with:

```sql
CREATE TABLE patients (
  patient_id       TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  address          TEXT,
  payer            TEXT,
  policy_no        TEXT,
  insurance_status TEXT,
  balance          REAL NOT NULL DEFAULT 0
);

CREATE TABLE appointments (
  appointment_id TEXT PRIMARY KEY,
  patient_id     TEXT NOT NULL,
  provider       TEXT,
  day_offset     INTEGER NOT NULL,   -- positive is the past, negative the future
  time           TEXT,
  type           TEXT,
  status         TEXT,
  reason         TEXT
);

CREATE TABLE invoices (
  invoice_id  TEXT PRIMARY KEY,
  patient_id  TEXT NOT NULL,
  day_offset  INTEGER NOT NULL,
  amount      REAL NOT NULL,
  status      TEXT,
  description TEXT
);

CREATE TABLE dialog_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  asked_at   TEXT NOT NULL,
  session_id TEXT,
  patient_id TEXT,
  question   TEXT NOT NULL,
  answer     TEXT,
  answered   INTEGER NOT NULL DEFAULT 1,
  tools      TEXT,
  ms         INTEGER
);

CREATE INDEX appointments_by_patient ON appointments(patient_id, day_offset);
CREATE INDEX invoices_by_patient     ON invoices(patient_id, day_offset);
CREATE INDEX dialog_log_by_day       ON dialog_log(asked_at);
```

Appointments and invoices are stored as day offsets rather than dates, so a seeded database still reads as "tomorrow" a year from now. **Say The Appointment** turns the offset into a real date at answer time.

4. **Edit the two system prompts.** They carry the practice's name, its telephone number and its rules, including the exact sentence each agent must use when the documents do not answer. Both are worth reading before you change them: the refusal sentence is what the dialog log counts.
5. **Run it on a robot.** The flow is a service. It stays running and answers calls, so it does not finish on its own.
6. **Call it from your site.** POST to `http://127.0.0.1:8080/mcp` with the bearer token and the tool arguments. Send `patient_id` **only** for a session you have checked yourself: everything behind the fork trusts it, which is exactly why the browser must never be able to set it.
