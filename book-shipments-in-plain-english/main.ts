import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', 'Book Shipments in Plain English', (f) => {
  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: "#### Book Shipments in Plain English\nSix orders go onto a carrier website that has no API. The whole job is six numbered steps of English in *The Runbook*, and the **Browser Act** node follows them page by page: it reads what is on the screen, and **Jev**, TypeSafe's decision model on OpenRouter, picks every next move. No step names a button or a field.\n\nJev also chooses each order's service from the customer's own note. It never writes text, so its output tokens cost nothing, and below a confidence of 0.55 the robot touches nothing: the node fails with the reason, *If an Order Gets Stuck* catches it, and the order goes into the sheet as stuck.\n\nNothing is taken on trust: *Read the Tracking Number* checks the page for a new tracking number that names this order, and `~/Orders/booked.csv` is the receipt." });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: "#### 🚀 Setup Guide\n\n**1.** Copy `assets/orders.csv` into a folder called `Orders` in your home directory, or write your own with the columns Reference, Consignee, Destination, Weight, Note.\n\n**2.** Admin Console > Vaults: add a **Login** item for the carrier and select it in *Get the Carrier Login*. SlugExpress is a training portal, and its demo account is printed on its own sign-in page, https://slugexpress.robomotion.online/portal/login.\n\n**3.** Add an **API Key** item that holds an OpenRouter key, and select it in the **Credentials** property of *Sign In* and *Book the Order*.\n\n**4.** Give your robot access to that vault. The Browser Act node needs Robomotion 26.9.3 or later on the robot.\n\n**5.** Run the flow. Chrome signs in and books every order, and `~/Orders/booked.csv` gets a service and a tracking number for each one." });

  f.node('c10001', 'Core.Trigger.Inject', 'Start', {})
    ;
  f.node('c10002', 'Core.Vault.GetItem', 'Get the Carrier Login', { optCredentials: Credential({ vaultId: '_', itemId: '_' }), outItem: Message('carrier') })
    ;
  f.node('c10003', 'Core.CSV.ReadCSV', "Read Today's Orders", { inFilePath: JS('global.get("$Home$") + "/Orders/orders.csv"'), outTable: Message('orders'), optHeaders: true })
    ;
  f.node('c10004', 'Core.Programming.Function', 'The Runbook', { func: `
/* The whole job, in plain English.
   The words in braces are filled in from each order. */
msg.runbook = [
  '1. Enter the consignee.',
  '2. Choose {destination} as the destination.',
  '3. Enter the order reference, then go on to the next step.',
  '4. Choose the service. The customer wrote: {note}',
  '   Standard is for a customer in no hurry. Express is for one who needs it this week.',
  '   TurboSlug is only for when something is stopped until it arrives.',
  '5. Enter the weight, then go on to the next step.',
  '6. Create the shipment.',
  'The goal is done when the page shows a shipping label addressed to {consignee}.'
];

msg.booked = [];
msg.decisions = 0;
msg.model_ms = 0;
return msg;
` })
    ;
  f.node('c10005', 'Core.Browser.Open', 'Open Chrome', { optCustomBrowserOptions: ['window-size=1600,1000'] })
    ;
  f.node('c10006', 'Core.Browser.OpenLink', 'Open the Carrier', { inUrl: Custom('https://slugexpress.robomotion.online/login') })
    ;
  f.node('c10007', 'Core.Browser.Act', 'Sign In', { inGoal: Custom('Sign in to the business portal.'), inValues: JS('({ "the sign-in email": msg.carrier.username, "the sign-in password": msg.carrier.password })'), optProvider: 'openrouter', optDecisionModel: 'typesafe/jev-1.13', optCredentials: Credential({ vaultId: '_', itemId: '_' }), outResult: Message('signin') })
    ;
  f.node('c10008', 'Core.Flow.Label', 'Next Order', {})
    ;
  f.node('c10009', 'Core.Programming.ForEach', 'For Each Order', { optInput: Message('orders.rows'), optOutput: Message('order') })
    ;
  f.node('c1000a', 'Core.Programming.Function', 'Write the Instructions', { func: `
var o = msg.order;
var NL = String.fromCharCode(10);

msg.goal = msg.runbook.join(NL)
  .split('{destination}').join(o.Destination)
  .split('{note}').join(o.Note)
  .split('{consignee}').join(o.Consignee);

/* The model only ever sees these labels. The robot types the values. */
msg.values = {
  'the consignee': o.Consignee,
  'the order reference': o.Reference,
  'the weight in kilograms': String(o.Weight)
};

msg.proof_json = '';
msg.act = null;
return msg;
` })
    ;
  f.node('c1000b', 'Core.Browser.OpenLink', 'Open a Blank Shipment', { inUrl: Custom('https://slugexpress.robomotion.online/portal/shipments/new'), optSameTab: true })
    ;
  f.node('c1000c', 'Core.Browser.Act', 'Book the Order', { inGoal: Message('goal'), inValues: Message('values'), optProvider: 'openrouter', optDecisionModel: 'typesafe/jev-1.13', optCredentials: Credential({ vaultId: '_', itemId: '_' }), optMaxSteps: Custom('20'), outResult: Message('act') })
    ;
  f.node('c1000d', 'Core.Browser.RunScript', 'Read the Tracking Number', { outResult: Message('proof_json'), func: `
/* Proof in code, not the model's word for it. The carrier's tracking
   numbers have a public format: SLUG-7, seven digits, -DE. The page
   must also name this order, or it is some earlier order's label. */
var text = document.body.innerText;
var at = text.indexOf('SLUG-7');
return JSON.stringify({
  tracking: at < 0 ? '' : text.substring(at, at + 16),
  consignee: text.indexOf(msg.order.Consignee) >= 0,
  reference: text.indexOf(msg.order.Reference) >= 0
});
` })
    ;
  f.node('c1000e', 'Core.Programming.Function', 'Note It Down', { func: `
/* An order the Act node could not finish arrives here from the Catch, with
   the node's own result still on the message. */
var a = msg.act || { status: 'blocked', reason: msg.error ? msg.error.message : '', steps: 0, model_ms: 0, trace: [] };
var o = msg.order;
msg.proof = msg.proof_json ? JSON.parse(msg.proof_json) : { tracking: '' };
msg.decisions = msg.decisions + a.steps;
msg.model_ms = msg.model_ms + a.model_ms;

/* Which service did it choose? The last SELECT on the Service field, or the
   form's own default when the note asked for no change. */
var service = 'Standard';
for (var i = 0; i < a.trace.length; i++) {
  var t = a.trace[i].target || '';
  if (a.trace[i].operation === 'SELECT' && t.indexOf('Service') >= 0) {
    service = t.substring(t.lastIndexOf(' ') + 1);
  }
}

/* A new tracking number, on a page that names this order. */
var seen = false;
for (var j = 0; j < msg.booked.length; j++) {
  if (msg.booked[j].Tracking && msg.booked[j].Tracking === msg.proof.tracking) {
    seen = true;
  }
}
var proven = a.status === 'done' && msg.proof.tracking !== '' && !seen &&
  msg.proof.consignee && msg.proof.reference;

var result = 'booked';
if (!proven) {
  result = a.status === 'done' ? 'not proven on the page' : 'stuck: ' + a.reason;
}

msg.booked.push({
  Reference: o.Reference,
  Consignee: o.Consignee,
  Service: proven ? service : '',
  Tracking: proven ? msg.proof.tracking : '',
  Result: result,
  Decisions: a.steps,
  Note: o.Note
});
return msg;
` })
    ;
  f.node('c1000f', 'Core.Flow.GoTo', 'Go To Next Order', { optNodes: { ids: ['c10008'], type: 'goto', all: false } })
    ;
  f.node('c10010', 'Core.Programming.Function', 'Make the Sheet', { func: `
msg.decisions = msg.decisions + msg.signin.steps;
msg.model_ms = msg.model_ms + msg.signin.model_ms;

msg.table = {
  columns: ['Reference', 'Consignee', 'Service', 'Tracking', 'Result', 'Decisions', 'Note'],
  rows: msg.booked
};

var ok = 0;
for (var i = 0; i < msg.booked.length; i++) {
  if (msg.booked[i].Result === 'booked') {
    ok = ok + 1;
  }
}
msg.summary = ok + ' of ' + msg.booked.length + ' orders booked in ' + msg.decisions +
  ' decisions, ' + (msg.model_ms / 1000).toFixed(1) + ' seconds of model time.';
return msg;
` })
    ;
  f.node('c10011', 'Core.CSV.WriteCSV', 'Write the Booked Sheet', { inFilePath: JS('global.get("$Home$") + "/Orders/booked.csv"'), inTable: Message('table'), optHeaders: true })
    ;
  f.node('c10012', 'Core.Flow.Log', 'Say What Happened', { inText: Message('summary') })
    ;
  f.node('c10013', 'Core.Browser.Close', 'Close Chrome', {})
    ;
  f.node('c10099', 'Core.Flow.Stop', 'Stop', {})
    ;
  f.node('c10014', 'Core.Flow.GoTo', 'Start the Orders', { optNodes: { ids: ['c10008'], type: 'goto', all: false } })
    ;
  f.node('c10015', 'Core.Flow.GoTo', 'Go To Close', { optNodes: { ids: ['c10016'], type: 'goto', all: false } })
    ;
  f.node('c10016', 'Core.Flow.Label', 'Close the Browser', {})
    ;
  f.node('c10017', 'Core.Trigger.Catch', 'If Sign In Gets Stuck', { optNodes: { type: 'catch', ids: ['c10007'], all: false } })
    ;
  f.node('c10018', 'Core.Trigger.Catch', 'If an Order Gets Stuck', { optNodes: { type: 'catch', ids: ['c1000c'], all: false } })
    ;

  f.edge('c10001', 0, 'c10002', 0);
  f.edge('c10002', 0, 'c10003', 0);
  f.edge('c10003', 0, 'c10004', 0);
  f.edge('c10004', 0, 'c10005', 0);
  f.edge('c10005', 0, 'c10006', 0);
  f.edge('c10006', 0, 'c10007', 0);
  f.edge('c10007', 1, 'c10014', 0);
  f.edge('c10017', 0, 'c10015', 0);
  f.edge('c10016', 0, 'c10013', 0);
  f.edge('c10008', 0, 'c10009', 0);
  f.edge('c10009', 0, 'c1000a', 0);
  f.edge('c10009', 1, 'c10010', 0);
  f.edge('c1000a', 0, 'c1000b', 0);
  f.edge('c1000b', 0, 'c1000c', 0);
  f.edge('c1000c', 1, 'c1000d', 0);
  f.edge('c10018', 0, 'c1000e', 0);
  f.edge('c1000d', 0, 'c1000e', 0);
  f.edge('c1000e', 0, 'c1000f', 0);
  f.edge('c10010', 0, 'c10011', 0);
  f.edge('c10011', 0, 'c10012', 0);
  f.edge('c10011', 0, 'c10013', 0);
  f.edge('c10013', 0, 'c10099', 0);
}).start();
