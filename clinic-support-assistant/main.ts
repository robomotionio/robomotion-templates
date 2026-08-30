import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

// Clinic Support Assistant.
//
// A support assistant for a website, served to the page as one MCP tool. Everything
// that decides anything is in this flow: the bridge in front of it holds no model, no
// prompt and no tool selection, so changing what the assistant may do is changing this
// canvas and nothing else.
//
// The shape worth copying is the fork in the middle. A visitor and a signed-in patient
// are answered by two different agents, and the difference is not a prompt or a flag,
// it is two wires. The visitor's agent is wired to the practice's documents and to
// nothing else, so there is no tool on that side of the canvas that could read a
// patient's record, whatever the model is asked.
//
// The signed-in tools take NO arguments. They read msg.patient_id, which the bridge
// established from a session cookie before this flow ever saw the question, so the
// model cannot name a patient: not its own, not anyone's.
//
// Worked here as a family practice, but the pattern is any support desk that answers
// strangers from public documents and customers from their own record.
flow.create('main', "Clinic Support Assistant", (f) => {
  f.addDependency('Robomotion.MCP', '0.6.0');
  f.addDependency('Robomotion.HermesAgent', '0.21.2');
  f.addDependency('Robomotion.KnowledgeBase', '0.1.7');
  f.addDependency('Robomotion.SQLite', '1.6.4');

  // Two comment boxes, in their own column on the canvas: what this is, and what has to exist
  // before it can run. A screenshot cannot show a vault item or a knowledge base.
  f.node('c10001', 'Core.Flow.Comment', 'Comment', { optText: '#### Clinic Support Assistant\nA support assistant for a website, served to the page as **one MCP tool**. Everything that decides anything is in this flow: the bridge in front of it holds no model, no prompt and no tool list.\n\nThe shape worth copying is the **fork**. A visitor and a signed-in patient are answered by two different agents, and the difference is not a prompt or a flag, it is two wires. The visitor agent is wired to the documents and to nothing else, so nothing on that side of the canvas can reach a patient record whatever the model is asked.\n\nThe signed-in tools take **no arguments**. They read the record number the bridge established from a session cookie, so the model cannot name a patient: not its own, not anybody else.' });

  f.node('c10002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n1. **Vault.** Two items, both selected in this flow. An *API Key* item with your OpenRouter key, chosen under **API Key** in both agents. An *API Key* item holding a bearer token you invent, chosen under **Token** in **Serve The Assistant**: your website sends that token and nothing else may call the tool.\n2. **Knowledge base.** Create one called `Harborview Practice` and index the pages a visitor is allowed to read. If yours has another name, change it in **Practice Documents**.\n3. **Database.** The signed-in tools read `~/harborview/harborview.db`: tables `patients` (patient_id, payer, policy_no, insurance_status, balance), `appointments` (patient_id, provider, day_offset, time, type, status, reason), `invoices` (patient_id, day_offset, amount, status, description) and `dialog_log`. The full schema is in the README.\n4. **Run it on a robot.** The flow is a service. It stays running and answers calls; it does not finish.\n5. **Call it from your site.** POST to `http://127.0.0.1:8080/mcp` with the bearer token and the tool arguments. Send `patient_id` **only** for a session you have checked yourself: everything behind the fork trusts it.' });

  f.node('d61001', 'Robomotion.MCP.Server.ListenHTTP', 'Serve The Assistant', {
      optName: Custom('Harborview Family Clinic'), optVersion: Custom('1.0.0'),
      optIP: Custom('127.0.0.1'), optPort: Custom('8080'), optEndpoint: Custom('/mcp'),
      optStateless: true, optDisableStreaming: true, optCallTimeout: Custom('120'),
      optToken: Credential({ vaultId: '_', itemId: '_' }) })
    ;

  f.node('d61002', 'Robomotion.MCP.Server.ToolIn', 'Ask Harborview', {
      inToolName: Custom('ask_harborview'),
      inToolDescription: Custom('Answer a question about Harborview Family Clinic from the practice documents. Answers about the patient own appointment or account only when the caller has a verified session.'),
      outToolName: Message('tool'), outParameters: Message('parameters'),
      func: `{
  "type": "object",
  "properties": {
    "question": {
      "type": "string",
      "description": "The question, in the language the patient wrote it in."
    },
    "session_id": {
      "type": "string",
      "description": "Chat session id, used to keep the conversation and to write the dialog log."
    },
    "patient_id": {
      "type": "string",
      "description": "Medical record number of the signed-in patient. Set by the bridge from a verified session cookie, never by the browser. Absent for a visitor."
    }
  },
  "required": [
    "question",
    "session_id"
  ]
}` })
    .then('d61003', 'Core.Programming.Function', 'Read The Question', { func: `var p = msg.parameters || {};

// Where the practice database is. Set here, before the fork, because a tool branch
// runs on the message the agent was called with - which is also why the SQL below can
// read {{{patient_id}}} without the model ever naming a patient.
msg.db = 'Data Source=' + global.get('$Home$') + '/harborview/harborview.db;Version=3;';

msg.question = String(p.question || '').trim();
msg.session_id = String(p.session_id || 'anonymous');
msg.started = Date.now();

// A patient id reaches this flow only from the bridge, which put it there after
// checking a session cookie. Check its shape anyway: it is about to be read as
// a patient's identity, and anything that is not a record number is not one.
var claimed = String(p.patient_id || '').trim();
msg.patient_id = /^MRN-[0-9]{5}$/.test(claimed) ? claimed : '';

// One conversation per widget session, and a signed-in patient gets their own,
// so a shared computer cannot inherit the last person's thread.
msg.agent_session = msg.patient_id ? msg.session_id + ':' + msg.patient_id : msg.session_id;

return msg;` })
    .then('d61004', 'Core.Programming.Switch', 'Is This A Patient', {
      optConditions: [Custom("msg.patient_id == ''"), Custom("msg.patient_id != ''")],
      optUseBreak: true })
    ;

  f.node('d61005', 'Robomotion.HermesAgent.Agent.HermesAgent', 'Answer For A Visitor', {
      inQuery: Message('question'), inSessionId: Message('agent_session'),
      inAgentName: Custom('harborview_visitor'),
      outText: Message('answer'), outMessages: Message('messages'),
      optModelName: 'openrouter/deepseek-v4-flash', optUseRobomotionCredits: false,
      optProvider: 'openrouter',
      optApiKey: Credential({ vaultId: '_', itemId: '_' }),
      optMaxIterations: Custom('6'), optMaxTurnSeconds: Custom('120'),
      optMemoryProvider: 'off', optMemorySync: 'off',
      optReasoningEffort: 'none', optToolSearch: 'off',
      func: `You are the assistant on the public website of Harborview Family Clinic, a family practice in Hamburg.

Answer only from the practice's own documents. Search them with kb_search before every answer, even when you think you already know.

If the documents do not answer the question, reply with exactly this sentence: I could not find that in the practice's documents. Then give the practice telephone number, +49 40 555 0100, and stop.

Never give medical advice. Do not interpret a symptom, a medicine or a test result, and never suggest a treatment. Say that it needs a clinician, and point to open surgery or the telephone number.

You are talking to a visitor, not to a signed-in patient. You have no way to see anyone's appointment, account or record, so never guess at one: say that they can sign in to the patient area, or telephone the practice.

Reply in the language the question was written in. Keep it under sixty words, and say only what the documents say.` })
    ;

  f.node('d61006', 'Robomotion.HermesAgent.Agent.HermesAgent', 'Answer For A Patient', {
      inQuery: Message('question'), inSessionId: Message('agent_session'),
      inAgentName: Custom('harborview_patient'),
      outText: Message('answer'), outMessages: Message('messages'),
      optModelName: 'openrouter/deepseek-v4-flash', optUseRobomotionCredits: false,
      optProvider: 'openrouter',
      optApiKey: Credential({ vaultId: '_', itemId: '_' }),
      optMaxIterations: Custom('6'), optMaxTurnSeconds: Custom('120'),
      optMemoryProvider: 'off', optMemorySync: 'off',
      optReasoningEffort: 'none', optToolSearch: 'off',
      func: `You are the assistant on the website of Harborview Family Clinic, a family practice in Hamburg, and you are talking to a patient who has signed in.

Answer questions about the practice only from its own documents. Search them with kb_search before every answer, even when you think you already know.

For anything about this patient's own appointment or account, use my_appointments or my_account. They take no arguments and always return the record of the person who is signed in, so never ask who they are and never mention a record number.

If neither the documents nor those two tools answer the question, reply with exactly this sentence: I could not find that in the practice's documents. Then give the practice telephone number, +49 40 555 0100, and stop.

Never give medical advice. Do not interpret a symptom, a medicine or a test result, and never suggest a treatment. Say that it needs a clinician, and point to open surgery or the telephone number.

Reply in the language the question was written in. Keep it under sixty words, and say only what the documents and the tools said.` })
    ;

  // The documents. One toolkit, serving both agents: what a visitor may read and
  // what a patient may read are the same pages of the same website.
  f.node('d61007', 'Robomotion.KnowledgeBase.Agents.Toolkit', 'Practice Documents', {
      optKnowledgeBase: Custom('Harborview Practice'), optEnabled: ['kb_search'] })
    ;

  f.node('d61008', 'Robomotion.HermesAgent.Tool.ToolIn', 'My Appointments', {
      inCallerId: Message('caller_id'),
      inToolName: Custom('my_appointments'),
      inToolDescription: Custom('The signed-in patient next appointment at the practice: the date, the time, the clinician and what it is for. Takes no arguments.'),
      outToolName: Message('tool'), outParameters: Message('parameters'),
      optTimeout: Custom('30'),
      // No properties, on purpose. A tool that cannot be told who to look up
      // cannot be talked into looking up somebody else.
      func: `{
  "type": "object",
  "properties": {}
}` })
    .then('d61009', 'Robomotion.SQLite.Query', 'Find The Appointment', {
      optConnectionString: Message('db'),
      outResult: Message('appointments'),
      func: `SELECT appointment_id, provider, day_offset, time, type, reason
FROM appointments
WHERE patient_id = '{{{patient_id}}}'
  AND status = 'Scheduled'
  AND day_offset < 0
ORDER BY day_offset DESC
LIMIT 1` })
    .then('d6100a', 'Core.Programming.Function', 'Say The Appointment', { func: `var rows = (msg.appointments && msg.appointments.rows) || [];

if (!rows.length) {
  msg.result = { found: false, note: 'No appointment is booked. Appointments are made by telephone on +49 40 555 0100.' };
  return msg;
}

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];

// The seed stores day offsets, not dates: positive is the past, negative the
// future. Resolving them here is what keeps "tomorrow" true a year from now.
var row = rows[0];
var offset = Number(row.day_offset);
var d = new Date();
d.setHours(0, 0, 0, 0);
d.setDate(d.getDate() - Math.round(offset));

msg.result = {
  found: true,
  date: days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear(),
  when: offset === -1 ? 'tomorrow' : (offset === 0 ? 'today' : 'in ' + Math.abs(offset) + ' days'),
  time: row.time,
  provider: row.provider,
  type: row.type,
  reason: row.reason
};

return msg;` })
    .then('d6100b', 'Robomotion.HermesAgent.Tool.ToolOut', 'Appointment Answer', {
      inCallerId: Message('caller_id'), inResult: Message('result') })
    ;

  f.node('d6100c', 'Robomotion.HermesAgent.Tool.ToolIn', 'My Account', {
      inCallerId: Message('caller_id'),
      inToolName: Custom('my_account'),
      inToolDescription: Custom('The signed-in patient account at the practice: what they owe, who their insurer is, and their most recent invoice. Takes no arguments.'),
      outToolName: Message('tool'), outParameters: Message('parameters'),
      optTimeout: Custom('30'),
      func: `{
  "type": "object",
  "properties": {}
}` })
    .then('d6100d', 'Robomotion.SQLite.Query', 'Find The Account', {
      optConnectionString: Message('db'),
      outResult: Message('account'),
      func: `SELECT p.balance, p.payer, p.policy_no, p.insurance_status,
       i.invoice_id, i.day_offset AS invoice_offset, i.amount, i.description, i.status AS invoice_status
FROM patients p
LEFT JOIN invoices i ON i.patient_id = p.patient_id
WHERE p.patient_id = '{{{patient_id}}}'
ORDER BY i.day_offset ASC
LIMIT 1` })
    .then('d6100e', 'Core.Programming.Function', 'Say The Account', { func: `var rows = (msg.account && msg.account.rows) || [];

if (!rows.length) {
  msg.result = { found: false, note: 'No account record was found.' };
  return msg;
}

var months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];

function money(n) {
  return Number(n).toFixed(2) + ' euro';
}

function dateOf(offset) {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - Math.round(Number(offset)));
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

var row = rows[0];

msg.result = {
  found: true,
  balance: money(row.balance),
  insurer: row.payer,
  cover: String(row.insurance_status).toLowerCase(),
  last_invoice: row.invoice_id
    ? { reference: row.invoice_id, amount: money(row.amount), date: dateOf(row.invoice_offset),
        status: String(row.invoice_status).toLowerCase(), was_for: row.description }
    : null,
  terms: 'Invoices are payable within 21 days. Instalments can be agreed with Diego Ramirez.'
};

return msg;` })
    .then('d6100f', 'Robomotion.HermesAgent.Tool.ToolOut', 'Account Answer', {
      inCallerId: Message('caller_id'), inResult: Message('result') })
    ;

  f.node('d61010', 'Core.Programming.Function', 'Log The Turn', { func: `var answer = String(msg.answer || '').trim();

// The one sentence both system prompts are told to use when the documents do
// not answer the question. Matching on it is what makes the daily report able
// to put the unanswered questions first.
var declined = answer.indexOf('I could not find that in the practice') !== -1;

// A turn that fell over is not a turn that was answered. Without this the
// report counts a provider outage as a satisfied patient, and the practice
// reads a clean morning that never happened.
if (!answer || answer.indexOf('API call failed') === 0 || answer.indexOf('Traceback') !== -1) {
  answer = 'The assistant could not be reached for this question.';
  declined = true;
}

// Which tools this turn used, read from the agent's own message history.
// Two things to be careful about. The history is the WHOLE conversation, so
// start at the last thing the patient said or a second question inherits the
// first one's tools. And a model that has been talking to a signed-in patient
// will ask for my_appointments after they sign out: the runtime refuses it,
// because that agent was never wired to it, and a refused call is not a tool
// that ran - so anything this branch was not given is dropped below.
var used = [];
var messages = msg.messages || [];
var from = 0;
for (var u = messages.length - 1; u >= 0; u--) {
  if (messages[u] && messages[u].role === 'user') { from = u; break; }
}
for (var i = from; i < messages.length; i++) {
  var m = messages[i] || {};
  var calls = m.tool_calls || [];
  for (var j = 0; j < calls.length; j++) {
    var c = calls[j] || {};
    var name = c.name || (c.function && c.function.name) || '';
    if (name && used.indexOf(name) === -1) used.push(name);
  }
  if (m.role === 'tool' && m.name && used.indexOf(m.name) === -1) used.push(m.name);
}

// Only tools this branch actually has.
var granted = msg.patient_id
  ? ['knowledgebase_kb_search', 'my_appointments', 'my_account']
  : ['knowledgebase_kb_search'];
var ran = [];
for (var k = 0; k < used.length; k++) {
  if (granted.indexOf(used[k]) !== -1) ran.push(used[k]);
}
used = ran;

// A single quote ends a string literal in SQL, so double it. The values below
// are written into the statement by the SQLite node's template, and a question
// typed by a stranger is exactly the wrong thing to trust.
function sql(s) {
  return String(s == null ? '' : s).replace(/'/g, "''");
}

msg.log = {
  question: sql(msg.question),
  answer: sql(answer),
  session: sql(msg.session_id),
  patient: sql(msg.patient_id),
  answered: declined ? 0 : 1,
  tools: sql(used.join(' ')),
  ms: Date.now() - Number(msg.started || Date.now())
};

// What the website gets back. The bridge reads answer and logs the rest.
msg.result = {
  answer: answer,
  answered: !declined,
  tools: used,
  patient: msg.patient_id || null
};
msg.is_error = false;

return msg;` })
    .then('d61011', 'Robomotion.SQLite.NonQuery', 'Write The Log', {
      optConnectionString: Message('db'),
      outAffectedRows: Message('logged'),
      func: `INSERT INTO dialog_log (asked_at, session_id, patient_id, question, answer, answered, tools, ms)
VALUES (datetime('now', 'localtime'), '{{{log.session}}}', '{{{log.patient}}}',
        '{{{log.question}}}', '{{{log.answer}}}', {{{log.answered}}}, '{{{log.tools}}}', {{{log.ms}}})` })
    .then('d61012', 'Robomotion.MCP.Server.ToolOut', 'Answer', {
      inResult: Message('result'), inIsError: Message('is_error') })
    ;

  f.edge('d61001', 0, 'd61002', 0);

  // The fork. Port 0 is a visitor, port 1 is a signed-in patient.
  f.edge('d61004', 0, 'd61005', 0);
  f.edge('d61004', 1, 'd61006', 0);

  // Tools port (0) on each agent. The visitor gets the documents; the patient
  // gets the documents and their own record. This is the fence.
  f.edge('d61005', 0, 'd61007', 0);
  f.edge('d61006', 0, 'd61007', 0);
  f.edge('d61006', 0, 'd61008', 0);
  f.edge('d61006', 0, 'd6100c', 0);

  // Port 2 is the agent's ordinary output: the answer, on its way to the log.
  f.edge('d61005', 2, 'd61010', 0);
  f.edge('d61006', 2, 'd61010', 0);
}).start();
