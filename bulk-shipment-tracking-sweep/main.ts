import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('b5e1c07', 'Bulk Shipment Tracking Sweep', function (f) {
  f.addDependency('Robomotion.MemoryQueue', '0.2.0');

  f.node('c00001', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### Bulk Shipment Tracking Sweep\n\nReads 200 tracking numbers from the SlugExpress bulk page, then checks every one of them on the public tracker using 8 parallel workers pulling from a shared queue.\n\nWrites shipment-status.csv (all 200) and shipment-exceptions.csv (customs holds, failed deliveries and delays) to your home folder. No login required.'
  });

  f.node('c00002', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 1. Read the tracking list\n\nA headless browser opens the bulk page, reveals the tracking-number textarea and scrapes all 200 numbers out of it. Reading the list off the page keeps it in sync with the site.\n\nThe numbers go into a Memory Queue; a second queue collects results. **Fork Branch** then starts the 8 workers.'
  });

  f.node('c00003', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 2. Eight parallel workers\n\nEvery branch gets its own Chrome profile directory: Chrome will not start two browsers on one profile, and **Browser → Open** does not create the directory itself.\n\nEach worker then loops — dequeue a number, open /track/:no, scrape status, last event and ETA, enqueue the row, and jump back to **Next Tracking No**. Workers pull from the same queue, so a worker that draws slow pages simply takes fewer numbers.'
  });

  f.node('c00004', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 3. When the queue runs dry\n\nWith no items left, **Dequeue** throws. The Catch node ends the worker cleanly: close its browser, then call **WG Done** so Fork Branch can count the branch as finished.'
  });

  f.node('c00005', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 4. Drain the results queue\n\nOnce all 8 workers have signalled WG Done, Fork Branch continues on its second port and the results queue is drained one row at a time.'
  });

  f.node('c00006', 'Core.Flow.Comment', 'Comment', {
    optText:
      '### 5. Write the CSVs\n\nDraining throws when the queue empties too. This Catch builds both tables: every shipment in shipment-status.csv, and the customs holds, failed deliveries and delays in shipment-exceptions.csv.'
  });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'Setup', {
      func: `msg.base_url = 'https://slugexpress.robomotion.online';
msg.bulk_url = msg.base_url + '/bulk';
msg.t0 = Date.now();
return msg;`
    })
    .then('a10003', 'Core.Browser.Open', 'Open Reader Browser', {
      optBrowser: 'chrome',
      outBrowserId: Message('reader_browser')
    })
    .then('a10004', 'Core.Browser.OpenLink', 'Open Bulk Page', {
      inBrowserId: Message('reader_browser'),
      inUrl: Message('bulk_url'),
      outPageId: Message('reader_page')
    })
    .then('a10005', 'Core.Browser.ClickElement', 'Reveal Number List', {
      inPageId: Message('reader_page'),
      inSelector: Custom('//*[@data-testid="bulk-toggle-input"]')
    })
    .then('a10006', 'Core.Browser.WaitElement', 'Wait For Textarea', {
      inPageId: Message('reader_page'),
      inSelector: Custom('//textarea'),
      optTimeout: Custom('20')
    })
    .then('a10007', 'Core.Browser.RunScript', 'Read Tracking Numbers', {
      inPageId: Message('reader_page'),
      func: `var ta = document.querySelector('textarea');
var nums = ta ? (ta.value.match(/SLUG-\\d+-[A-Z]{2}/g) || []) : [];
return JSON.stringify(nums);`,
      outResult: Message('numbers_json')
    })
    .then('a10008', 'Core.Browser.Close', 'Close Reader Browser', {
      inBrowserId: Message('reader_browser')
    })
    .then('a10009', 'Core.Programming.Function', 'Queue Tracking Numbers', {
      func: `msg.tracking = JSON.parse(msg.numbers_json);
console.log('Tracking numbers queued: ' + msg.tracking.length);
return msg;`
    })
    .then('a1000a', 'Robomotion.MemoryQueue.Create', 'Create Work Queue', {
      optElements: Message('tracking'),
      outQueueID: Message('work_qid')
    })
    .then('a1000b', 'Robomotion.MemoryQueue.Create', 'Create Results Queue', {
      outQueueID: Message('results_qid')
    })
    .then('a1000c', 'Core.Flow.ForkBranch', 'Fork 8 Workers', {
      optNofBranches: Custom('8'),
      outBranchID: Message('branch_id'),
      outWaitGroupID: Message('wg_id')
    });

  // ---------------------------------------------------------------- Port 0: the 8 workers
  // Each parallel browser needs its OWN user-data dir, or Chrome refuses to start.
  f.node('b20000', 'Core.Programming.Function', 'Worker Profile Dir', {
    func: `var id = String(msg.branch_id).replace(/[^0-9a-zA-Z]/g, '-');
msg.user_data_dir = global.get('$TempDir$') + '/slug-sweep-' + msg.t0 + '-' + id;
return msg;`
  });
  f.edge('a1000c', 0, 'b20000', 0);

  // Core.Browser.Open does NOT create optUserDataDir; it fails with "The specified User
  // Data Dir '...' does not exist". Make it first, or all 8 workers die on launch.
  f.node('b2000f', 'Core.FileSystem.Create', 'Make Profile Dir', {
    inPath: Message('user_data_dir'),
    optType: 'directory',
    outPath: Message('user_data_dir_created')
  });
  f.edge('b20000', 0, 'b2000f', 0);

  f.node('b20001', 'Core.Browser.Open', 'Worker Browser', {
    optBrowser: 'chrome',
    optUserDataDir: Message('user_data_dir'),
    outBrowserId: Message('worker_browser')
  });
  f.edge('b2000f', 0, 'b20001', 0);

  f.node('b20002', 'Core.Browser.OpenLink', 'Worker Home Page', {
    inBrowserId: Message('worker_browser'),
    inUrl: Message('base_url'),
    outPageId: Message('worker_page'),
    optBlockImages: true,
    optBlockCSS: true
  });
  f.edge('b20001', 0, 'b20002', 0);

  // Label has no input port — it is purely a jump target for GoTo.
  f.node('b20003', 'Core.Flow.Label', 'Next Tracking No', {});

  f.node('b20004', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Tracking No', {
    inQueueID: Message('work_qid'),
    outElement: Message('tno')
  });
  f.edge('b20002', 0, 'b20004', 0); // first pass enters the body directly
  f.edge('b20003', 0, 'b20004', 0); // later passes arrive via the label

  f.node('b20005', 'Core.Programming.Function', 'Build Track URL', {
    func: `msg.track_url = msg.base_url + '/track/' + msg.tno; return msg;`
  });
  f.edge('b20004', 0, 'b20005', 0);

  f.node('b20006', 'Core.Browser.OpenLink', 'Open Tracking Page', {
    inBrowserId: Message('worker_browser'),
    inPageId: Message('worker_page'),
    inUrl: Message('track_url'),
    optSameTab: true,
    optBlockImages: true,
    optBlockCSS: true
  });
  f.edge('b20005', 0, 'b20006', 0);

  f.node('b20007', 'Core.Browser.WaitElement', 'Wait For Result', {
    inPageId: Message('worker_page'),
    inSelector: Custom('//*[@data-testid="track-status" or @data-testid="track-not-found"]'),
    optTimeout: Custom('20')
  });
  f.edge('b20006', 0, 'b20007', 0);

  f.node('b20008', 'Core.Browser.RunScript', 'Scrape Shipment', {
    inPageId: Message('worker_page'),
    func: `function txt(sel) { var e = document.querySelector(sel); return e ? e.innerText.trim() : ''; }
if (document.querySelector('[data-testid="track-not-found"]')) {
  return JSON.stringify({ status: 'Not Found', last_event: '', last_event_location: '', eta: '', is_exception: 'no' });
}
var status = txt('[data-testid="track-status"]');
var eta = txt('[data-testid="track-eta"]');
var desc = '';
var loc = '';
var row = document.querySelector('[data-testid="track-event-row"]');
if (row) {
  var mid = row.children[1];
  if (mid) {
    var sp = mid.querySelectorAll('span');
    if (sp.length > 0) { desc = sp[0].innerText.trim(); }
  }
  var bot = row.children[2];
  if (bot) { loc = bot.innerText.split('\\u00b7')[0].trim(); }
}
var exc = (status === 'Customs Hold' || status === 'Failed Delivery' || status === 'Delayed') ? 'yes' : 'no';
return JSON.stringify({ status: status, last_event: desc, last_event_location: loc, eta: eta, is_exception: exc });`,
    outResult: Message('row_json')
  });
  f.edge('b20007', 0, 'b20008', 0);

  f.node('b20009', 'Core.Programming.Function', 'Tag Row', {
    func: `var row = JSON.parse(msg.row_json);
row.tracking_no = msg.tno;
msg.row = JSON.stringify(row);
return msg;`
  });
  f.edge('b20008', 0, 'b20009', 0);

  f.node('b2000a', 'Robomotion.MemoryQueue.Enqueue', 'Enqueue Result', {
    inQueueID: Message('results_qid'),
    inElement: Message('row')
  });
  f.edge('b20009', 0, 'b2000a', 0);

  f.node('b2000b', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['b20003'], type: 'goto', all: false }
  });
  f.edge('b2000a', 0, 'b2000b', 0);

  // Work queue empty -> this worker is finished.
  f.node('b2000c', 'Core.Trigger.Catch', 'Work Queue Empty', {
    optNodes: { type: 'catch', ids: ['b20004'], all: false }
  });
  f.node('b2000d', 'Core.Browser.Close', 'Close Worker Browser', {
    inBrowserId: Message('worker_browser')
  });
  f.edge('b2000c', 0, 'b2000d', 0);

  f.node('b2000e', 'Core.WaitGroup.Done', 'Worker Done', {
    inWaitGroupID: Message('wg_id')
  });
  f.edge('b2000d', 0, 'b2000e', 0);

  // ---------------------------------------------------------------- Port 1: drain results, write CSVs
  f.node('c30001', 'Core.Flow.Label', 'Drain Results', {});

  f.node('c30002', 'Robomotion.MemoryQueue.Dequeue', 'Dequeue Result', {
    inQueueID: Message('results_qid'),
    outElement: Message('res')
  });
  f.edge('a1000c', 1, 'c30002', 0); // all workers finished -> start draining
  f.edge('c30001', 0, 'c30002', 0); // later passes arrive via the label

  f.node('c30003', 'Core.Programming.Function', 'Collect Row', {
    func: `if (!msg.rows) { msg.rows = []; }
msg.rows.push(JSON.parse(msg.res));
return msg;`
  });
  f.edge('c30002', 0, 'c30003', 0);

  f.node('c30004', 'Core.Flow.GoTo', 'Next Result', {
    optNodes: { ids: ['c30001'], type: 'goto', all: false }
  });
  f.edge('c30003', 0, 'c30004', 0);

  // Results queue empty -> every row collected.
  f.node('c30005', 'Core.Trigger.Catch', 'Results Drained', {
    optNodes: { type: 'catch', ids: ['c30002'], all: false }
  });

  f.node('c30006', 'Core.Programming.Function', 'Build Tables', {
    func: `var home = global.get('$Home$');
msg.status_csv = home + '/shipment-status.csv';
msg.exceptions_csv = home + '/shipment-exceptions.csv';

var cols = ['tracking_no', 'status', 'last_event', 'last_event_location', 'eta', 'is_exception'];
var rows = msg.rows || [];
rows.sort(function (a, b) { return a.tracking_no < b.tracking_no ? -1 : (a.tracking_no > b.tracking_no ? 1 : 0); });

// Scraped innerText can carry stray control characters and runs of whitespace.
function clean(v) {
  var s = (v === undefined || v === null) ? '' : String(v);
  s = s.replace(/[\\u0000-\\u001F\\u007F]/g, ' ');
  return s.replace(/\\s+/g, ' ').replace(/^ | $/g, '');
}

var all = [];
for (var i = 0; i < rows.length; i++) {
  var o = {};
  for (var c = 0; c < cols.length; c++) {
    o[cols[c]] = clean(rows[i][cols[c]]);
  }
  all.push(o);
}
msg.status_table = { columns: cols, rows: all };

var exc = [];
for (var j = 0; j < all.length; j++) {
  if (all[j].is_exception === 'yes') { exc.push(all[j]); }
}
exc.sort(function (a, b) { return a.status < b.status ? -1 : (a.status > b.status ? 1 : 0); });

var elapsed = Math.round((Date.now() - msg.t0) / 1000);
exc.push({ tracking_no: 'ELAPSED_SECONDS', status: String(elapsed), last_event: '', last_event_location: '', eta: '', is_exception: '' });
msg.exceptions_table = { columns: cols, rows: exc };

console.log('Checked ' + all.length + ' shipments | exceptions: ' + (exc.length - 1) + ' | elapsed: ' + elapsed + 's');

// Hand the CSV nodes a clean message: drop the raw scrape buffers, the browser
// and queue handles, and the error object the Catch attached.
delete msg.rows;
delete msg.tracking;
delete msg.numbers_json;
delete msg.res;
delete msg.row;
delete msg.row_json;
delete msg.tno;
delete msg.track_url;
delete msg.error;
delete msg.reader_browser;
delete msg.reader_page;
delete msg.worker_browser;
delete msg.worker_page;
delete msg.work_qid;
delete msg.results_qid;
delete msg.wg_id;
delete msg.branch_id;
delete msg.t0;
return msg;`
  });
  f.edge('c30005', 0, 'c30006', 0);

  f.node('c30007', 'Core.CSV.WriteCSV', 'Write Status CSV', {
    inFilePath: Message('status_csv'),
    inTable: Message('status_table'),
    optEncoding: 'utf8',
    optSeparator: 'comma',
    optHeaders: true
  });
  f.edge('c30006', 0, 'c30007', 0);

  f.node('c30008', 'Core.CSV.WriteCSV', 'Write Exceptions CSV', {
    inFilePath: Message('exceptions_csv'),
    inTable: Message('exceptions_table'),
    optEncoding: 'utf8',
    optSeparator: 'comma',
    optHeaders: true
  });
  f.edge('c30007', 0, 'c30008', 0);

  f.node('c30009', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c30008', 0, 'c30009', 0);
}).start();
