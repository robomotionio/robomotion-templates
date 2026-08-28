import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "FRS VAT Tool", (f) => {
  f.addDependency('Robomotion.MCP', '0.6.0');

  f.node('b21001', 'Robomotion.MCP.Server.ListenHTTP', 'Serve The Tool', { optName: Custom('Freedonia Tax Portal'), optVersion: Custom('1.0.0'),
                  optIP: Custom('0.0.0.0'), optPort: Custom('8080'), optEndpoint: Custom('/mcp'),
                  optStateless: true, optCallTimeout: Custom('120'),
                  optToken: Credential({ vaultId: '_', itemId: '_' }) })
    ;
  f.node('b21002', 'Robomotion.MCP.Server.ToolIn', 'List Clients', { inToolName: Custom('list_clients'),
                  inToolDescription: Custom('List the client companies this account is an authorised representative for, with their tax numbers and access level.'),
                  func: `{
  "type": "object",
  "properties": {}
}` })
    ;
  f.node('b21003', 'Robomotion.MCP.Server.ToolIn', 'Check VAT Status', { inToolName: Custom('check_vat_status'),
                  inToolDescription: Custom('Check a client company VAT filing status and any outstanding penalties. Use this when asked whether a company has filed, is late, or owes money.'),
                  func: `{
  "type": "object",
  "properties": {
    "company": {
      "type": "string",
      "description": "The client company name, e.g. Oceanic Imports"
    }
  },
  "required": [
    "company"
  ]
}` })
    ;
  f.node('b21004', 'Robomotion.MCP.Server.ToolIn', 'Find E Invoice', { inToolName: Custom('find_einvoice'),
                  inToolDescription: Custom('Find electronic invoices for a client company, optionally filtered to one counterparty.'),
                  func: `{
  "type": "object",
  "properties": {
    "company": {
      "type": "string",
      "description": "The client company name, e.g. Oceanic Imports"
    },
    "counterparty": {
      "type": "string",
      "description": "Optional. Only invoices to or from this counterparty, e.g. Alpine Water"
    }
  },
  "required": [
    "company"
  ]
}` })
    ;
  f.node('b21005', 'Core.Flow.SubFlow', 'Sign In', {})
    .then('b21006', 'Core.Browser.RunScript', 'Read The Mandates', { func: `var out = [];
var els = document.querySelectorAll('button[data-testid="mandate-option"]');
for (var i = 0; i < els.length; i++) {
  out.push(els[i].getAttribute('data-id') + '|' + els[i].innerText.replace(/\\s+/g, ' ').trim());
}
return out.join('\\n');`, outResult: Message('mandates') })
    .then('b21007', 'Core.Programming.Switch', 'Route By Tool', { optConditions: [Custom("msg.tool == 'list_clients'"),
                                         Custom("msg.tool == 'check_vat_status'"),
                                         Custom("msg.tool == 'find_einvoice'")],
                         optUseBreak: true })
    ;
  f.node('b21008', 'Core.Programming.Function', 'Build Client List', { func: `var clients = [];
var lines = String(msg.mandates || '').split('\\n');

for (var i = 0; i < lines.length; i++) {
  var line = lines[i];
  if (!line) continue;
  var bar = line.indexOf('|');
  var taxId = line.slice(0, bar);
  var label = line.slice(bar + 1);
  clients.push({
    taxId: taxId,
    name: label.replace(taxId, '').replace(/(FULL ACCESS|VIEW ONLY)/i, '').trim(),
    access: /VIEW ONLY/i.test(label) ? 'view only' : 'full access'
  });
}

msg.result = { clients: clients, count: clients.length };
msg.is_error = false;
return msg;` })
    ;
  f.node('b21009', 'Core.Programming.Function', 'Find The Company', { outputs: 3, func: `var asked = String((msg.parameters && msg.parameters.company) || '').trim();
var needle = asked.toLowerCase();
var lines = String(msg.mandates || '').split('\\n');
var hit = null;

for (var i = 0; i < lines.length; i++) {
  if (needle && lines[i].toLowerCase().indexOf(needle) !== -1) { hit = lines[i]; break; }
}

if (!hit) {
  msg.result = 'No mandate is held for "' + asked + '". This service account can only read ' +
    'companies it is an authorised representative for.';
  msg.is_error = true;
  return [null, null, msg];
}

msg.company = asked;
msg.taxId = hit.slice(0, hit.indexOf('|'));
msg.selector = "//button[@data-testid='mandate-option'][@data-id='" + msg.taxId + "']";
msg.is_error = false;
return msg.tool === 'find_einvoice' ? [null, msg, null] : [msg, null, null];` })
    ;
  f.node('b2100a', 'Core.Flow.SubFlow', 'Read The Company', {})
    .then('b2100b', 'Core.Programming.Function', 'Build VAT Answer', { func: `function rowsOf(t) { return (t && t.rows) || []; }

function field(row, want) {
  for (var k in row) {
    if (row.hasOwnProperty(k) && k.toLowerCase() === want) return String(row[k]);
  }
  return '';
}

function money(text) {
  var n = parseFloat(text.replace(/[^0-9.,]/g, '').replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

var returns = rowsOf(msg.returns);
var penalties = rowsOf(msg.penalties);
var owed = 0;
var late = [];

for (var i = 0; i < penalties.length; i++) owed += money(field(penalties[i], 'amount'));
for (var j = 0; j < returns.length; j++) {
  if (field(returns[j], 'status').toLowerCase().indexOf('late') !== -1) late.push(returns[j]);
}

msg.result = {
  company: msg.company,
  taxId: msg.taxId,
  lateReturns: late,
  penalties: penalties,
  totalOutstanding: Math.round(owed * 100) / 100
};
msg.is_error = false;
return msg;` })
    ;
  f.node('b2100c', 'Core.Flow.SubFlow', 'Read The Invoices', {})
    .then('b2100d', 'Core.Programming.Function', 'Build Invoice Answer', { func: `function rowsOf(t) { return (t && t.rows) || []; }

function field(row, want) {
  for (var k in row) {
    if (row.hasOwnProperty(k) && k.toLowerCase() === want) return String(row[k]);
  }
  return '';
}

function money(text) {
  var n = parseFloat(text.replace(/[^0-9.,]/g, '').replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

var wanted = String((msg.parameters && msg.parameters.counterparty) || '').toLowerCase().trim();
var rows = rowsOf(msg.invoices);
var found = [];

for (var i = 0; i < rows.length; i++) {
  var who = field(rows[i], 'counterparty');
  if (wanted && who.toLowerCase().indexOf(wanted) === -1) continue;

  // The portal puts the counterparty name and its tax number on two lines of one cell,
  // and a scrape joins them with nothing between: "Alpine Water AGFD-109299717".
  var split = who.match(/^(.*?)(FD-[0-9]+)$/);
  found.push({
    documentId: field(rows[i], 'document id'),
    direction: field(rows[i], 'direction'),
    counterparty: split ? split[1].trim() : who,
    counterpartyTaxId: split ? split[2] : '',
    issueDate: field(rows[i], 'issue date'),
    gross: field(rows[i], 'gross')
  });
}

msg.result = {
  company: msg.company,
  counterparty: wanted || 'any',
  invoices: found,
  count: found.length
};
msg.is_error = false;
return msg;` })
    ;
  f.node('b2100e', 'Core.Browser.Close', 'Close The Browser', {})
    .then('b2100f', 'Robomotion.MCP.Server.ToolOut', 'Return To The Client', {})
    ;

  f.edge('b21001', 0, 'b21002', 0);
  f.edge('b21001', 0, 'b21003', 0);
  f.edge('b21001', 0, 'b21004', 0);
  f.edge('b21002', 0, 'b21005', 0);
  f.edge('b21003', 0, 'b21005', 0);
  f.edge('b21004', 0, 'b21005', 0);
  f.edge('b21006', 0, 'b21007', 0);
  f.edge('b21007', 0, 'b21008', 0);
  f.edge('b21007', 1, 'b21009', 0);
  f.edge('b21007', 2, 'b21009', 0);
  f.edge('b21009', 0, 'b2100a', 0);
  f.edge('b21009', 1, 'b2100c', 0);
  f.edge('b21009', 2, 'b2100e', 0);
  f.edge('b21008', 0, 'b2100e', 0);
  f.edge('b2100a', 0, 'b2100b', 0);
  f.edge('b2100b', 0, 'b2100e', 0);
  f.edge('b2100c', 0, 'b2100d', 0);
  f.edge('b2100d', 0, 'b2100e', 0);
}).start();
