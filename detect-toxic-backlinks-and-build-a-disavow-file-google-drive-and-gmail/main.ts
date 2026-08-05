import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('4c8e15b7-3d92-4a06-8f57-e1b204d9c73a', 'Toxic Backlink Disavow File', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoogleDrive', '1.2.0');
  f.addDependency('Robomotion.Gmail', '1.1.0');

  f.node('a03e71', 'Core.Flow.Comment', 'About', {
    optText: '### Detect toxic backlinks and build a disavow file\nPages through every backlink pointing at your domain with a spam score above the threshold, writes the source URLs into a Google-compliant `disavow.txt`, uploads it to Google Drive and emails you the link.\n\nTwo guards exist because Google rejects oversized submissions: the run stops with an explanatory email if there are more than 100,000 toxic links, or if the finished file would exceed 2 MB.\n\n**Review the file before uploading it to Search Console.** Disavowing a good link costs you the equity it was passing, and the action is slow to reverse.'
  });

  f.node('7b2f04', 'Core.Flow.Comment', 'Collect', {
    optText: '#### Collect\nOne page of 1000 backlinks per pass, filtered server-side on `backlink_spam_score`. The Label/GoTo pair below walks Offset until `total_count` is exhausted.'
  });

  f.node('e51c8d', 'Core.Trigger.Inject', 'Run', { optOnce: true, optOnceDelay: 1 })
    .then('20a976', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.target = 'dataforseo.com';
msg.notify_email = 'user@example.com';
msg.drive_folder_id = 'root';
msg.disavow_path = '/tmp/disavow.txt';

// Anything above 50 is considered toxic by DataForSEO's own scale. Raise it to
// be more conservative about what you ask Google to ignore.
msg.spam_threshold = 50;
msg.filters = [['backlink_spam_score', '>', msg.spam_threshold]];

msg.offset = 0;
msg.page_size = 1000;
msg.urls = [];
return msg;`
    });

  // Label is a jump target only - it has no input port, so the first pass enters
  // the loop body directly and the GoTo at the end comes back through the Label.
  f.node('c74b39', 'Core.Flow.Label', 'Next Page', {});

  f.node('58d0e2', 'Robomotion.DataForSEO.Backlinks.Backlinks', 'Get Spam Backlinks', {
    inTarget: Message('target'),
    inFilters: Message('filters'),
    optMode: 'as_is',
    optStatusType: 'live',
    optLimit: Message('page_size'),
    optOffset: Message('offset'),
    outItems: Message('items'),
    outResult: Message('result'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' }
  });
  f.edge('20a976', 0, '58d0e2', 0);
  f.edge('c74b39', 0, '58d0e2', 0);

  f.node('9e4a16', 'Core.Programming.Function', 'Accumulate Page', {
    outputs: 3,
    func: `// Port 0: too many toxic links to disavow safely.
// Port 1: another page to fetch.
// Port 2: collection finished.
var result = (msg.result && msg.result[0]) || {};
var total = result.total_count || 0;

if (msg.offset === 0 && total >= 100000) {
  msg.error_reason = 'You have too many disavow links (' + total + '). Please tighten the ' +
    'request parameters to generate a valid disavow file.';
  return [msg, null, null];
}

var items = msg.items || [];
for (var i = 0; i < items.length; i++) {
  if (items[i].url_from) msg.urls.push(items[i].url_from);
}

msg.total_count = total;
msg.offset = msg.offset + msg.page_size;

if (msg.offset < total && items.length > 0) {
  return [null, msg, null];
}
return [null, null, msg];`
  });
  f.edge('58d0e2', 0, '9e4a16', 0);

  f.node('316bc0', 'Core.Flow.GoTo', 'Go To Next Page', {
    optNodes: { ids: ['c74b39'], type: 'goto', all: false }
  });
  f.edge('9e4a16', 1, '316bc0', 0);

  f.node('d82750', 'Core.Flow.Comment', 'Build & deliver', {
    optText: '#### Build & deliver\nThe disavow format is one source URL per line. The file is written locally, uploaded to Drive, and the link is emailed for review.'
  });

  f.node('6fa093', 'Core.Programming.Function', 'Build Disavow File', {
    outputs: 2,
    func: `// Disavow format: one url per line, plain UTF-8 text.
var text = msg.urls.join('\\n');

// Byte length without Buffer, which the sandbox does not provide: count the
// UTF-8 bytes each code point expands to.
var bytes = 0;
for (var i = 0; i < text.length; i++) {
  var c = text.charCodeAt(i);
  if (c < 0x80) bytes += 1;
  else if (c < 0x800) bytes += 2;
  else if (c >= 0xD800 && c <= 0xDBFF) { bytes += 4; i++; }
  else bytes += 3;
}

msg.disavow_text = text;
msg.file_size = bytes;
msg.link_count = msg.urls.length;

if (bytes >= 2000000) {
  msg.error_reason = 'The file size is ' + bytes + ' bytes, more than the 2 MB Google accepts. ' +
    'Please tighten the request parameters to generate a valid disavow file.';
  return [null, msg];
}
return [msg, null];`
  });
  f.edge('9e4a16', 2, '6fa093', 0);

  f.node('1a5d68', 'Core.FileSystem.WriteFile', 'Write disavow.txt', {
    inPath: Message('disavow_path'),
    inText: Message('disavow_text'),
    optMode: 'truncate'
  })
    .then('b30cf4', 'Robomotion.GoogleDrive.Upload', 'Upload To Drive', {
      inFilePath: Message('disavow_path'),
      inParentId: Message('drive_folder_id'),
      outDriveFileId: Message('file_id'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('e9714b', 'Core.Programming.Function', 'Compose Success Mail', {
      func: `msg.mail_subject = 'Disavow File Generated - ' + msg.target + ' - ' +
  new Date().toISOString().slice(0, 10);
msg.mail_body = '<html><body>' +
  '<p>Your disavow file for ' + msg.target + ' has been generated: ' +
  '<a href="https://drive.google.com/file/d/' + msg.file_id + '">Your disavow file</a></p>' +
  '<p>It lists ' + msg.link_count + ' backlinks with a spam score above ' + msg.spam_threshold + '.</p>' +
  '<p>Please review it before uploading to Google Search Console.</p>' +
  '</body></html>';
return msg;`
    })
    .then('54c827', 'Robomotion.Gmail.Messages.Send', 'Send Disavow Link', {
      inTo: Message('notify_email'),
      inSubject: Message('mail_subject'),
      inBody: Message('mail_body'),
      optIsHTML: true,
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('0b6ed3', 'Core.Flow.Stop', 'Done', {});
  f.edge('6fa093', 0, '1a5d68', 0);

  f.node('f2807a', 'Core.Programming.Function', 'Compose Error Mail', {
    func: `msg.mail_subject = 'Disavow File Error - ' + msg.target + ' - ' +
  new Date().toISOString().slice(0, 10);
msg.mail_body = msg.error_reason;
return msg;`
  })
    .then('7d1c95', 'Robomotion.Gmail.Messages.Send', 'Send Error Mail', {
      inTo: Message('notify_email'),
      inSubject: Message('mail_subject'),
      inBody: Message('mail_body'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('93ae40', 'Core.Flow.Stop', 'Stop With Error', { optSuccess: 'failed', optReason: Message('error_reason') });

  f.edge('9e4a16', 0, 'f2807a', 0);
  f.edge('6fa093', 1, 'f2807a', 0);
}).start();
