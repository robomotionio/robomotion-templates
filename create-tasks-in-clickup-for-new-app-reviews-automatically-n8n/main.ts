import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('84a6c20f-b790-420b-b58d-43f9c0e6a875', 'App Reviews to ClickUp Tasks', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.ClickUp', '1.1.0');

  f.node('e1740b', 'Core.Flow.Comment', 'About', {
    optText: '### Create ClickUp tasks for new app reviews\n' +
      'Every morning, pull the newest reviews for your app from both Google Play and the App Store, keep only ' +
      'the ones written since the last run, and open one ClickUp task per store holding the digest.\n\n' +
      'A task rather than a message because reviews usually need a reply or a bug filed - putting them in the ' +
      'tracker means they get triaged instead of scrolled past.\n\n' +
      'App reviews have no live endpoint, so each store call submits a task and polls until it is ready - the ' +
      'Label/GoTo pairs below are that wait.'
  });

  f.node('3c92e5', 'Core.Flow.Comment', 'Configure', {
    optText: '#### Configure\nThe Google Play package name, the App Store numeric id, the ClickUp list that receives ' +
      'the tasks, how many reviews to pull, and how far back counts as new.'
  });

  f.node('a06d17', 'Core.Trigger.Inject', 'Daily', {
    optOnce: false,
    optRepeat: 86400,
    optOnceDelay: 10
  })
    .then('7fb230', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.google_app_id = 'com.duolingo';
msg.apple_app_id = '570060128';
msg.clickup_list_id = 'REPLACE_WITH_LIST_ID';

msg.location_name = 'United States';
msg.language_name = 'English';
msg.depth = 10;

// Reviews newer than this cutoff are treated as new. Keep it in step with the
// trigger interval so nothing is reported twice and nothing is missed.
msg.since = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();

msg.google_task = {
  app_id: msg.google_app_id,
  location_name: msg.location_name,
  language_name: msg.language_name,
  depth: msg.depth,
  sort_by: 'newest'
};
msg.apple_task = {
  app_id: msg.apple_app_id,
  location_name: msg.location_name,
  language_name: msg.language_name,
  depth: msg.depth,
  sort_by: 'most_recent'
};

msg.polls = 0;
msg.max_polls = 20;
return msg;`
    });

  f.node('80c4ea', 'Core.Flow.Comment', 'Google Play', {
    optText: '#### Google Play\nSubmit the review task, then poll `task_get` every 15 seconds until DataForSEO ' +
      'reports it finished (status 20000) or the attempt budget runs out.'
  });

  f.node('5b28f1', 'Robomotion.DataForSEO.Account.RawRequest', 'Submit Google Play Task', {
    inPath: Custom('/app_data/google/app_reviews/task_post'),
    inBody: Message('google_task'),
    optMethod: 'POST',
    optTimeout: Custom('120'),
    outResponse: Message('response'),
    optCredentials: { vaultId: '_', itemId: '_' }
  });
  f.edge('7fb230', 0, '5b28f1', 0);

  f.node('c603d4', 'Core.Programming.Function', 'Read Google Task Id', {
    func: `var task = ((msg.response || {}).tasks || [])[0] || {};
msg.task_id = task.id || '';
msg.task_path = '/app_data/google/app_reviews/task_get/' + msg.task_id;
msg.store = 'Google Play';
msg.polls = 0;
return msg;`
  });
  f.edge('5b28f1', 0, 'c603d4', 0);

  // Label is a jump target only - the first pass enters the poll body directly.
  f.node('9ae052', 'Core.Flow.Label', 'Poll Google', {});

  f.node('26f7bc', 'Core.Programming.Sleep', 'Wait For Google', {
    optDuration: Custom('15')
  });
  f.edge('c603d4', 0, '26f7bc', 0);
  f.edge('9ae052', 0, '26f7bc', 0);

  f.node('d40a83', 'Robomotion.DataForSEO.Account.RawRequest', 'Get Google Reviews', {
    inPath: Message('task_path'),
    optMethod: 'GET',
    optTimeout: Custom('120'),
    outResponse: Message('response'),
    outItems: Message('items'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('26f7bc', 0, 'd40a83', 0);

  f.node('f8b165', 'Core.Programming.Function', 'Is Google Ready', {
    outputs: 2,
    func: `// 20000 means the task finished; 40602 and friends mean "not yet".
var task = ((msg.response || {}).tasks || [])[0] || {};
msg.polls = msg.polls + 1;

var ready = task.status_code === 20000 && (msg.items || []).length >= 0 && task.result;
if (ready || msg.polls >= msg.max_polls) return [null, msg];
return [msg, null];`
  });
  f.edge('d40a83', 0, 'f8b165', 0);

  f.node('0e5c39', 'Core.Flow.GoTo', 'Poll Google Again', {
    optNodes: { ids: ['9ae052'], type: 'goto', all: false }
  });
  f.edge('f8b165', 0, '0e5c39', 0);

  f.node('b71fd6', 'Core.Programming.Function', 'Build Google Digest', {
    outputs: 2,
    func: `// Port 0: there is something to post. Port 1: nothing new since the cutoff.
var task = ((msg.response || {}).tasks || [])[0] || {};
var result = (task.result || [])[0] || {};
var items = result.items || [];
var fresh = [];

for (var i = 0; i < items.length; i++) {
  var r = items[i];
  var when = new Date(r.timestamp).getTime();
  if (isNaN(when) || when < msg.since) continue;
  fresh.push('Review ' + (fresh.length + 1) + ':' +
    '\\nRating: ' + ((r.rating && r.rating.value) || '') +
    '\\nDate: ' + r.timestamp +
    '\\nText: ' + (r.review_text || ''));
}

msg.app_title = result.title || msg.google_app_id;
msg.review_count = fresh.length;

if (fresh.length === 0) return [null, msg];

msg.task_name = fresh.length + ' new Google Play review(s) for ' + msg.app_title;
msg.announcement = 'You have ' + fresh.length + ' new review(s) for ' + msg.app_title +
  ' in the Google Play Store!\\n\\n' + fresh.join('\\n\\n');
return [msg, null];`
  });
  f.edge('f8b165', 1, 'b71fd6', 0);

  f.node('4d09a7', 'Robomotion.ClickUp.Tasks.Create', 'Open Google Reviews Task', {
    inListID: Message('clickup_list_id'),
    inName: Message('task_name'),
    inDescription: Message('announcement'),
    outTaskID: Message('task_id_clickup'),
    optCredentials: { vaultId: '_', itemId: '_' }
  });
  f.edge('b71fd6', 0, '4d09a7', 0);

  f.node('62ce80', 'Core.Flow.Comment', 'App Store', {
    optText: '#### App Store\nThe same submit-and-poll shape against the Apple endpoint, run after Google so ' +
      'the two digests arrive in a predictable order.'
  });

  f.node('a3861f', 'Robomotion.DataForSEO.Account.RawRequest', 'Submit App Store Task', {
    inPath: Custom('/app_data/apple/app_reviews/task_post'),
    inBody: Message('apple_task'),
    optMethod: 'POST',
    optTimeout: Custom('120'),
    outResponse: Message('response'),
    optCredentials: { vaultId: '_', itemId: '_' }
  });
  f.edge('4d09a7', 0, 'a3861f', 0);
  f.edge('b71fd6', 1, 'a3861f', 0);

  f.node('17e4b9', 'Core.Programming.Function', 'Read Apple Task Id', {
    func: `var task = ((msg.response || {}).tasks || [])[0] || {};
msg.task_id = task.id || '';
msg.task_path = '/app_data/apple/app_reviews/task_get/' + msg.task_id;
msg.store = 'App Store';
msg.polls = 0;
return msg;`
  });
  f.edge('a3861f', 0, '17e4b9', 0);

  f.node('cd7302', 'Core.Flow.Label', 'Poll Apple', {});

  f.node('90b6ae', 'Core.Programming.Sleep', 'Wait For Apple', {
    optDuration: Custom('15')
  });
  f.edge('17e4b9', 0, '90b6ae', 0);
  f.edge('cd7302', 0, '90b6ae', 0);

  f.node('7f21c5', 'Robomotion.DataForSEO.Account.RawRequest', 'Get App Store Reviews', {
    inPath: Message('task_path'),
    optMethod: 'GET',
    optTimeout: Custom('120'),
    outResponse: Message('response'),
    outItems: Message('items'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('90b6ae', 0, '7f21c5', 0);

  f.node('e0348d', 'Core.Programming.Function', 'Is Apple Ready', {
    outputs: 2,
    func: `var task = ((msg.response || {}).tasks || [])[0] || {};
msg.polls = msg.polls + 1;

var ready = task.status_code === 20000 && task.result;
if (ready || msg.polls >= msg.max_polls) return [null, msg];
return [msg, null];`
  });
  f.edge('7f21c5', 0, 'e0348d', 0);

  f.node('ba5e14', 'Core.Flow.GoTo', 'Poll Apple Again', {
    optNodes: { ids: ['cd7302'], type: 'goto', all: false }
  });
  f.edge('e0348d', 0, 'ba5e14', 0);

  f.node('35db07', 'Core.Programming.Function', 'Build App Store Digest', {
    outputs: 2,
    func: `var task = ((msg.response || {}).tasks || [])[0] || {};
var result = (task.result || [])[0] || {};
var items = result.items || [];
var fresh = [];

for (var i = 0; i < items.length; i++) {
  var r = items[i];
  var when = new Date(r.timestamp).getTime();
  if (isNaN(when) || when < msg.since) continue;
  fresh.push('Review ' + (fresh.length + 1) + ':' +
    '\\nRating: ' + ((r.rating && r.rating.value) || '') +
    '\\nDate: ' + r.timestamp +
    '\\nText: ' + (r.review_text || ''));
}

msg.app_title = result.title || msg.apple_app_id;
msg.review_count = fresh.length;

if (fresh.length === 0) return [null, msg];

msg.task_name = fresh.length + ' new App Store review(s) for ' + msg.app_title;
msg.announcement = 'You have ' + fresh.length + ' new review(s) for ' + msg.app_title +
  ' in the App Store!\\n\\n' + fresh.join('\\n\\n');
return [msg, null];`
  });
  f.edge('e0348d', 1, '35db07', 0);

  f.node('c84f60', 'Robomotion.ClickUp.Tasks.Create', 'Open App Store Reviews Task', {
    inListID: Message('clickup_list_id'),
    inName: Message('task_name'),
    inDescription: Message('announcement'),
    outTaskID: Message('task_id_clickup'),
    optCredentials: { vaultId: '_', itemId: '_' }
  });
  f.edge('35db07', 0, 'c84f60', 0);

  f.node('268bda', 'Core.Flow.Stop', 'Stop', {});
  f.edge('c84f60', 0, '268bda', 0);
  f.edge('35db07', 1, '268bda', 0);
}).start();
