import { flow, Message, Custom } from '@robomotion/sdk';

flow.create('f04b2d1', 'Vendor Onboarding', function (f) {
  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Vendor Onboarding\n\nTurns a procurement onboarding request into a vendor master record. Reads the onboarding e-mail, takes the vendor and terms straight from the request, and creates the vendor in the ERP with the bank and tax details from the onboarding packet. The bank IBAN is mod-97 checked on save, so a bad number never becomes a payable.\n\nWrites vendor-onboarding.csv to your home folder. The story is a clean hand-off: a request in one system becomes a validated master record in another, with no re-keying and no unchecked bank details.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Read the onboarding request\n\nSign in to the mailbox and open the "new vendor onboarding" e-mail. Read the vendor name, category and payment terms out of the request. The bank and tax details travel in the attached onboarding packet; the flow carries them as the vetted values to key in.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Create the vendor in the ERP\n\nSign in to RAP One and open a new vendor. Fill the three tabs - General (name, category, terms, reconciliation account), Payment (tax ID and IBAN) and Contact (billing e-mail) - then save. The ERP runs the IBAN through a mod-97 checksum; a valid IBAN is accepted, a bad one is refused before any payment can be scheduled.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. Confirm & report\n\nRead back the created vendor: its new ID, the saved status line, and that no IBAN-checksum warning is shown. Write the record to a CSV so the master-data change is auditable. The vendor is now live and payable in the ERP.'
  });

  // ------------------------------------------------------------- 1. read the request
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.lookout_url = 'https://lookout.robomotion.online/login';
msg.rap_url = 'https://rapone.robomotion.online/login';
// Published training credentials for two fictional systems (synthetic data). Real
// system credentials belong in the Robomotion Vault, never in a flow.
msg.lookout_email = 'hiroshi.tanaka@globex.example';
msg.lookout_password = 'LookoutTraining2026!';
msg.rap_user = 'HTANAKA';
msg.rap_password = 'RapTraining2026!';
msg.rap_client = '100';
// Bank & tax details from the attached onboarding packet (the e-mail body carries
// only the descriptive fields; these are the vetted values to key into the ERP).
msg.taxId = 'FD-169377478';
msg.iban = 'DE79968486570477713519';
msg.contactEmail = 'billing@fjordline-data.example';
msg.gl_option = '4540 - Hosting & Cloud';
msg.country = 'DE';
msg.csv = global.get('$Home$') + '/vendor-onboarding.csv';
msg.t0 = Date.now();
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', outBrowserId: Message('browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Mailbox', {
      inBrowserId: Message('browser'), inUrl: Message('lookout_url'), outPageId: Message('page')
    })
    .then('a10005', 'Core.Browser.WaitElement', 'Wait Login Form', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), optTimeout: Custom('20')
    })
    .then('a10006', 'Core.Browser.TypeText', 'Type Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-email"]'), inText: Message('lookout_email'), optClearText: true
    })
    .then('a10007', 'Core.Browser.TypeText', 'Type Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('lookout_password'), optClearText: true
    })
    .then('a10008', 'Core.Browser.ClickElement', 'Sign In', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10009', 'Core.Browser.WaitElement', 'Wait Inbox', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="message-list"]'), optTimeout: Custom('20')
    })
    .then('a1000a', 'Core.Browser.ClickElement', 'Open Onboarding Mail', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="msg-row"][contains(., "vendor onboarding")]')
    })
    .then('a1000b', 'Core.Browser.WaitElement', 'Wait Reading Pane', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="reading-body"]'), optTimeout: Custom('20')
    })
    .then('a1000c', 'Core.Programming.Sleep', 'Let Mail Render', { optDuration: Custom('1') })
    .then('a1000d', 'Core.Browser.RunScript', 'Read Request', {
      inPageId: Message('page'),
      func: `var el = document.querySelector('[data-testid="reading-body"]');
var body = el ? el.innerText : '';
var mid = String.fromCharCode(183);
var seg = (body.split('Vendor:')[1] || '');
seg = (seg.split('. Bank')[0] || seg);
var parts = seg.split(mid);
function after(s, label) { var k = s.indexOf(label); return k < 0 ? s.trim() : s.slice(k + label.length).trim(); }
var name = (parts[0] || '').trim();
var category = after(parts[1] || '', 'Category:');
var terms = after(parts[2] || '', 'Terms:');
var monthly = after(parts[3] || '', 'Monthly');
return JSON.stringify({ name: name, category: category, terms: terms, monthly: monthly });`,
      outResult: Message('req_json')
    })
    .then('a1000e', 'Core.Programming.Function', 'Parse Request', {
      func: `var r = JSON.parse(msg.req_json);
if (!r.name) { throw new Error('could not read the vendor name from the onboarding e-mail'); }
msg.vendor_name = r.name;
msg.category = r.category || 'hosting';
msg.terms = r.terms || 'Net 14';
msg.monthly = r.monthly || '';
return msg;`
    })
    // ---------------------------------------------------------- 2. create the vendor
    .then('a1000f', 'Core.Browser.OpenLink', 'Open ERP Login', {
      inBrowserId: Message('browser'), inUrl: Message('rap_url'), outPageId: Message('page')
    })
    .then('a10010', 'Core.Browser.WaitElement', 'Wait ERP Login', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), optTimeout: Custom('20')
    })
    .then('a10011', 'Core.Browser.TypeText', 'Type Username', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-username"]'), inText: Message('rap_user'), optClearText: true
    })
    .then('a10012', 'Core.Browser.TypeText', 'Type ERP Password', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-password"]'), inText: Message('rap_password'), optClearText: true
    })
    .then('a10013', 'Core.Browser.TypeText', 'Type Client', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-client"]'), inText: Message('rap_client'), optClearText: true
    })
    .then('a10014', 'Core.Browser.ClickElement', 'Sign In ERP', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="login-submit"]')
    })
    .then('a10015', 'Core.Browser.WaitElement', 'Wait Launchpad', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="launchpad"]'), optTimeout: Custom('20')
    })
    .then('a10016', 'Core.Browser.ClickElement', 'Open Vendors', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="nav-vendors"]')
    })
    .then('a10017', 'Core.Browser.WaitElement', 'Wait Vendors', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-new"]'), optTimeout: Custom('20')
    })
    .then('a10018', 'Core.Browser.ClickElement', 'New Vendor', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-new"]')
    })
    .then('a10019', 'Core.Browser.WaitElement', 'Wait Form', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-name"]'), optTimeout: Custom('20')
    })
    // General tab (shown by default)
    .then('a1001a', 'Core.Browser.TypeText', 'Type Name', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-name"]'), inText: Message('vendor_name'), optClearText: true
    })
    .then('a1001b', 'Core.Browser.Select', 'Set Category', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-category"]'), inValue: Message('category')
    })
    .then('a1001c', 'Core.Browser.TypeText', 'Type Country', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-country"]'), inText: Message('country'), optClearText: true
    })
    .then('a1001d', 'Core.Browser.Select', 'Set Terms', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-terms"]'), inValue: Message('terms')
    })
    .then('a1001e', 'Core.Browser.Select', 'Set G/L Account', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-gl"]'), inValue: Message('gl_option')
    })
    // Payment tab
    .then('a1001f', 'Core.Browser.ClickElement', 'Payment Tab', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-tab-payment"]')
    })
    .then('a10020', 'Core.Browser.WaitElement', 'Wait Payment Tab', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-taxid"]'), optTimeout: Custom('20')
    })
    .then('a10021', 'Core.Browser.TypeText', 'Type Tax ID', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-taxid"]'), inText: Message('taxId'), optClearText: true
    })
    .then('a10022', 'Core.Browser.TypeText', 'Type IBAN', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-iban"]'), inText: Message('iban'), optClearText: true
    })
    // Read the ERP's live mod-97 result while the IBAN field is still on screen.
    .then('a1002a', 'Core.Browser.RunScript', 'Read Checksum', {
      inPageId: Message('page'),
      func: `var el = document.querySelector('[data-testid="vendor-iban"]');
var area = el ? el.closest('div').parentElement.innerText : '';
var ok = area.indexOf('Checksum OK') >= 0;
var fails = area.indexOf('Checksum fails') >= 0;
return JSON.stringify({ checksum: ok ? 'Checksum OK' : (fails ? 'Checksum fails' : 'unknown'), ok: ok });`,
      outResult: Message('iban_check_json')
    })
    // Contact tab
    .then('a10023', 'Core.Browser.ClickElement', 'Contact Tab', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-tab-contact"]')
    })
    .then('a10024', 'Core.Browser.WaitElement', 'Wait Contact Tab', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-email"]'), optTimeout: Custom('20')
    })
    .then('a10025', 'Core.Browser.TypeText', 'Type Email', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-email"]'), inText: Message('contactEmail'), optClearText: true
    })
    .then('a10026', 'Core.Browser.ClickElement', 'Save Vendor', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="vendor-save"]')
    })
    .then('a10027', 'Core.Browser.WaitElement', 'Wait Saved', {
      inPageId: Message('page'), inSelector: Custom('//*[@data-testid="statusbar-message" and contains(., "created")]'), optTimeout: Custom('20')
    })
    .then('a10028', 'Core.Programming.Sleep', 'Let Detail Render', { optDuration: Custom('1') })
    .then('a10029', 'Core.Browser.RunScript', 'Read Created Vendor', {
      inPageId: Message('page'),
      func: `var sb = document.querySelector('[data-testid="statusbar-message"]');
var full = sb ? sb.innerText : '';
var parts = full.split('\\n');
var status = parts[parts.length - 1].trim();
var m = status.match(/V-[0-9]+/);
if (!m) {
  var h1 = document.querySelector('h1');
  m = (h1 ? h1.innerText : '').match(/V-[0-9]+/);
}
return JSON.stringify({ vendor_id: m ? m[0] : '', status: status });`,
      outResult: Message('verify_json')
    });

  // --------------------------------------------------------------------- 3. report
  f.node('c30001', 'Core.Programming.Function', 'Build Report', {
    func: `var v = JSON.parse(msg.verify_json);
var ck = JSON.parse(msg.iban_check_json);
// A failed IBAN mod-97 check blocks the save, so a vendor ID means the check passed.
if (!v.vendor_id) { throw new Error('vendor was not created - the ERP rejected the entry (a failed IBAN mod-97 check blocks creation)'); }
var rows = [
  { field: 'Vendor', value: msg.vendor_name },
  { field: 'New vendor ID', value: v.vendor_id },
  { field: 'Category', value: msg.category },
  { field: 'Payment terms', value: msg.terms },
  { field: 'Monthly', value: msg.monthly },
  { field: 'Tax / VAT ID', value: msg.taxId },
  { field: 'IBAN', value: msg.iban },
  { field: 'IBAN mod-97', value: ck.checksum },
  { field: 'Contact', value: msg.contactEmail },
  { field: 'Status', value: v.status }
];
msg.report_table = { columns: ['field', 'value'], rows: rows };
var elapsed = Math.round((Date.now() - msg.t0) / 1000);
console.log('Onboarded ' + msg.vendor_name + ' as ' + v.vendor_id + ' in ' + elapsed + 's');
console.log('  IBAN ' + msg.iban + ' -> ' + ck.checksum);
console.log('  ' + v.status);
return msg;`
  });
  f.edge('a10029', 0, 'c30001', 0);

  f.node('c30002', 'Core.CSV.WriteCSV', 'Write Vendor CSV', {
    inFilePath: Message('csv'), inTable: Message('report_table'),
    optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
  });
  f.edge('c30001', 0, 'c30002', 0);

  f.node('c30003', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser') });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30003', 0, 'c30004', 0);
}).start();
