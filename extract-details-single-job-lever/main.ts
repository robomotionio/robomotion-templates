import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c001', 'Extract Details Single Job Lever', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://jobs.lever.co/spotify/3ada366b-14f4-421d-8dff-e96da1005b67';
        msg.csv_path = global.get('$Home$') + '/extract-details-single-job-lever.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Job', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('job_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Headline', {
      inPageId: Message('page_id'),
      inSelector: Custom('//div[contains(@class,"posting-headline")]//h2'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('.posting-headline h2');
        var locEl = document.querySelector('.posting-categories .location');
        var deptEl = document.querySelector('.posting-categories .department');
        var commitEl = document.querySelector('.posting-categories .commitment');
        var clean = function(s) { return (s || '').replace(/\\s*\\/\\s*$/, '').replace(/\\s+/g, ' ').trim(); };
        var deadline = '';
        var bodyText = document.body.innerText || '';
        var m = bodyText.match(/(?:Apply by|Application deadline|Closes on|Closing date)[:\\s]*([^\\n]+)/i);
        if (m) deadline = m[1].trim();
        var row = {
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Job Location': locEl ? clean(locEl.innerText) : '',
          'Team': deptEl ? clean(deptEl.innerText) : '',
          'Employment Type': commitEl ? clean(commitEl.innerText) : '',
          'Deadline': deadline
        };
        var columns = ['Job Title','Job Location','Team','Employment Type','Deadline'];
        return JSON.stringify({ columns: columns, rows: [row] });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `
        msg.table = JSON.parse(msg.table_json);
        return msg;
      `
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
