import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c004', 'Extract Job Details Working Nomads', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://www.workingnomads.com/jobs/content-creator-remote-marker-video';
        msg.csv_path = global.get('$Home$') + '/extract-job-details-working-nomads.csv';
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
    .then('555555', 'Core.Browser.WaitElement', 'Wait Title', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1[contains(@class,"jd-title")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('h1.jd-title');
        var companyEl = document.querySelector('div.jd-company');
        var lines = document.querySelectorAll('.jd-meta-line');
        var byIcon = {};
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
          var iconEl = l.querySelector('i.fa');
          var sp = l.querySelector('span');
          if (!iconEl || !sp) continue;
          var cls = iconEl.className || '';
          var key = '';
          if (cls.indexOf('fa-clock') >= 0) key = 'type';
          else if (cls.indexOf('fa-map-marker') >= 0) key = 'loc';
          else if (cls.indexOf('fa-calendar') >= 0) key = 'posted';
          if (key && !byIcon[key]) byIcon[key] = sp.innerText.replace(/\\s+/g, ' ').trim();
        }
        var row = {
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Company': companyEl ? companyEl.innerText.replace(/\\s+/g, ' ').trim() : '',
          'Location': byIcon.loc || '',
          'Job Type': byIcon.type || '',
          'Date Posted': byIcon.posted || '',
          'Link to Apply': window.location.href
        };
        var columns = ['Job Title','Company','Location','Job Type','Date Posted','Link to Apply'];
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
