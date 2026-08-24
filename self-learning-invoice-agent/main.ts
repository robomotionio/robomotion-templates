import { flow, Message, Custom } from '@robomotion/sdk';

// Self-Learning Invoice Agent — the DeepSeek Agent's learning feature on a real
// accounting job. Invoices land in ~/Invoices/inbox; each run picks one, the agent
// extracts vendor/number/date/total and records the row through the add_invoice_row
// tool (Tool In → Function → Append CSV → Tool Out), then the invoice is archived.
// With Learning On and Memory Sync Workspace, the first invoice from a vendor is
// worked out from scratch and the procedure is written down as a learned skill; every
// invoice after runs on what the agent learned — on this robot and, via the workspace
// memory, on every other robot running this flow.
//
// Agent ports: 0 = tools, 1 = callbacks, 2 = response. The response leaves on an
// explicit edge from port 2 — never chain .then() off the agent.
flow.create('8f7cf54a-6ed6-4f53-abc8-d1f6e0b50a4c', 'Self-Learning Invoice Agent', (f) => {
  f.addDependency('Robomotion.DeepSeekAgent', '0.7.5');

  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: '#### Self-Learning Invoice Agent\nDrop a supplier PDF into `~/Invoices/inbox` and run. The agent reads it, records vendor, invoice number, date and total through the **add_invoice_row** tool, and the invoice is archived to `~/Invoices/processed`.\n\nLearning is **On**: the first invoice from a vendor is worked out from scratch and the procedure becomes a learned skill (double-click the agent, Memory tab). Every invoice after runs on what the agent learned.' });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n1. Create the working folders and the ledger with its header row: `mkdir -p ~/Invoices/inbox ~/Invoices/processed` and `echo vendor,invoice_number,date,total,currency > ~/Invoices/accounting.csv`\n2. Put an OpenRouter API key into a Vault item (type: API Key), then select it in the Invoice Agent node API Key property. The default Base URL and model (deepseek/deepseek-v4-pro) already match OpenRouter.\n3. Drop a supplier invoice PDF into `~/Invoices/inbox`.\n4. Run the flow on a robot and watch the turn in the Dev Console Agents tab.\n5. Run again with a second invoice from the same vendor: the learned skill is offered back and nothing is re-derived.' });

  // ---- main path -------------------------------------------------------
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Prepare Paths', {
      func:
        "var home = global.get('$Home$');\n" +
        "msg.inbox = home + '/Invoices/inbox';\n" +
        "msg.processed = home + '/Invoices/processed';\n" +
        "msg.accounting = home + '/Invoices/accounting.csv';\n" +
        'return msg;',
    })
    .then('a10003', 'Core.FileSystem.List', 'List Inbox', {
      inDirPath: Message('inbox'),
      inNameFilter: Custom('\\.pdf$'),
      outFiles: Message('inbox_files'),
      optAbsolutePath: true,
    })
    .then('a10004', 'Core.Programming.Function', 'Pick Invoice', {
      outputs: 2,
      func:
        'var files = msg.inbox_files || [];\n' +
        'var pdfs = [];\n' +
        'for (var i = 0; i < files.length; i++) {\n' +
        '  var e = files[i];\n' +
        '  if (!e) { continue; }\n' +
        '  var isDir = e.IsDir === true || e.is_dir === true || e.isDir === true;\n' +
        "  var nm = e.Name || e.name || e.AbsolutePath || e.absolute_path || (typeof e === 'string' ? e : '');\n" +
        '  if (!isDir && nm) { pdfs.push(nm); }\n' +
        '}\n' +
        'if (pdfs.length === 0) { return [null, msg]; }\n' +
        'msg.invoice_path = pdfs[0];\n' +
        "var parts = msg.invoice_path.split('/');\n" +
        "msg.archive_path = msg.processed + '/' + parts[parts.length - 1];\n" +
        'msg.files = [msg.invoice_path];\n' +
        "msg.query = 'Process the supplier invoice PDF named ' + parts[parts.length - 1] + ' in your workspace. '\n" +
        "  + 'Extract the vendor name, invoice number, invoice date and the grand total due, '\n" +
        "  + 'then record exactly one row with the add_invoice_row tool. '\n" +
        "  + 'Be exact about numbers and dates - accounting reconciles against them. '\n" +
        "  + 'If no learned skill covered this supplier and you worked the layout out from scratch, '\n" +
        "  + 'record the whole procedure - including any traps - with the learn tool before replying. '\n" +
        "  + 'Afterwards reply with a one-line summary of what you recorded.';\n" +
        'return [msg, null];',
    });

  // Port 0: an invoice was found → run the agent. The API Key property is set from a
  // Vault item after import — see the Setup Guide comment.
  f.node('a1000a', 'Robomotion.DeepSeekAgent.Agent.DeepSeekAgent', 'Invoice Agent', {});
  f.edge('a10004', 0, 'a1000a', 0);

  // Port 1: inbox empty → a run that ends quietly instead of an error.
  f.node('a10009', 'Core.Flow.Stop', 'Inbox Empty', {});
  f.edge('a10004', 1, 'a10009', 0);

  // Agent output port 2 is the response.
  f.node('a10006', 'Core.FileSystem.Move', 'Archive Invoice', {
    inSrcPath: Message('invoice_path'),
    inDestPath: Message('archive_path'),
  });
  f.edge('a1000a', 2, 'a10006', 0);

  f.node('a10007', 'Core.Programming.Debug', 'Show Response', {});
  f.node('a10008', 'Core.Flow.Stop', 'Stop', {});
  f.edge('a10006', 0, 'a10007', 0);
  f.edge('a10006', 0, 'a10008', 0);

  // ---- the tool: add_invoice_row --------------------------------------
  // The description IS the interface: the agent never sees these nodes, only this
  // text and the parameter schema under it.
  f.node('b20001', 'Robomotion.DeepSeekAgent.Tool.ToolIn', 'add_invoice_row', {
    inToolName: Custom('add_invoice_row'),
    inToolDescription: Custom(
      'Record one extracted supplier invoice in the accounting sheet. ' +
        'Call exactly once per invoice, after every field has been extracted. ' +
        'The date must be the invoice date in ISO YYYY-MM-DD (never the delivery date); ' +
        'total is the grand total due including VAT as a plain number with a dot ' +
        'decimal separator and no thousands separators.'
    ),
    inFunc: Custom(
      'b64:ewogICJ0eXBlIjogIm9iamVjdCIsCiAgInByb3BlcnRpZXMiOiB7CiAgICAidmVuZG9yIjogewogICAgICAidHlwZSI6ICJzdHJpbmciLAogICAgICAiZGVzY3JpcHRpb24iOiAiU3VwcGxpZXIgY29tcGFueSBuYW1lIGFzIHByaW50ZWQgb24gdGhlIGludm9pY2UiCiAgICB9LAogICAgImludm9pY2VfbnVtYmVyIjogewogICAgICAidHlwZSI6ICJzdHJpbmciLAogICAgICAiZGVzY3JpcHRpb24iOiAiVGhlIGludm9pY2UgbnVtYmVyLCBlLmcuIEFDTS0yMDI2LTAxNDEiCiAgICB9LAogICAgImRhdGUiOiB7CiAgICAgICJ0eXBlIjogInN0cmluZyIsCiAgICAgICJkZXNjcmlwdGlvbiI6ICJJbnZvaWNlIGRhdGUgaW4gSVNPIGZvcm1hdCBZWVlZLU1NLUREIChub3QgdGhlIGRlbGl2ZXJ5IGRhdGUpIgogICAgfSwKICAgICJ0b3RhbCI6IHsKICAgICAgInR5cGUiOiAibnVtYmVyIiwKICAgICAgImRlc2NyaXB0aW9uIjogIkdyYW5kIHRvdGFsIGR1ZSBpbmNsdWRpbmcgVkFULCBhcyBhIHBsYWluIG51bWJlciB3aXRoIGRvdCBkZWNpbWFsIHNlcGFyYXRvciBhbmQgbm8gdGhvdXNhbmRzIHNlcGFyYXRvcnMiCiAgICB9LAogICAgImN1cnJlbmN5IjogewogICAgICAidHlwZSI6ICJzdHJpbmciLAogICAgICAiZGVzY3JpcHRpb24iOiAiSVNPIDQyMTcgY3VycmVuY3kgY29kZSwgZS5nLiBFVVIiCiAgICB9CiAgfSwKICAicmVxdWlyZWQiOiBbCiAgICAidmVuZG9yIiwKICAgICJpbnZvaWNlX251bWJlciIsCiAgICAiZGF0ZSIsCiAgICAidG90YWwiLAogICAgImN1cnJlbmN5IgogIF0KfQ=='
    ),
  })
    .then('b20002', 'Core.Programming.Function', 'Build Row', {
      func:
        'var p = msg.parameters || {};\n' +
        'msg.table = {\n' +
        "  columns: ['vendor', 'invoice_number', 'date', 'total', 'currency'],\n" +
        '  rows: [{\n' +
        "    vendor: p.vendor || '',\n" +
        "    invoice_number: p.invoice_number || '',\n" +
        "    date: p.date || '',\n" +
        '    total: p.total,\n' +
        "    currency: p.currency || 'EUR'\n" +
        '  }]\n' +
        '};\n' +
        "msg.result = { status: 'recorded', invoice_number: p.invoice_number, total: p.total, currency: p.currency || 'EUR' };\n" +
        'return msg;',
    })
    .then('b20003', 'Core.CSV.AppendCSV', 'Append To Accounting', {
      inFilePath: Message('accounting'),
      inTable: Message('table'),
    })
    .then('b20004', 'Robomotion.DeepSeekAgent.Tool.ToolOut', 'Tool Out', {});

  // The tools port (agent output port 0) discovers the Tool In.
  f.edge('a1000a', 0, 'b20001', 0);
}).start();
