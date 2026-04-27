import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('a1c006', 'Extract Job Details Dribbble', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.job_url = msg.job_url || 'https://dribbble.com/jobs/222494-Product-Designer-in-UX-UI-w-m-d';
        msg.csv_path = global.get('$Home$') + '/extract-job-details-dribbble.csv';
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
      inSelector: Custom('//h1[contains(@class,"job-details-title")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Job', {
      inPageId: Message('page_id'),
      func: `
        var titleEl = document.querySelector('h1.job-details-title');
        var orgEl = document.querySelector('.organization-name');
        var siteEl = document.querySelector('.sidebar-header-container a[href][target="_blank"]');
        var sublabels = document.querySelectorAll('.font-sublabel');
        var fields = {};
        for (var i = 0; i < sublabels.length; i++) {
          var sl = sublabels[i];
          var label = (sl.innerText || '').trim().toLowerCase();
          var values = [];
          var sib = sl.nextElementSibling;
          while (sib && sib.classList && sib.classList.contains('font-label')) {
            values.push((sib.innerText || '').trim());
            sib = sib.nextElementSibling;
          }
          if (label) fields[label] = values;
        }
        var locs = fields['location'] || [];
        var loc1 = locs[0] || '';
        var loc2 = locs[1] || '';
        var jobType = (fields['job type'] || [''])[0];
        var datePosted = (fields['date posted'] || [''])[0];
        var description = '';
        var paragraphs = document.querySelectorAll('.job-details-page-container p');
        var bits = [];
        for (var p = 0; p < paragraphs.length; p++) {
          var t = (paragraphs[p].innerText || '').replace(/\\s+/g, ' ').trim();
          if (t) bits.push(t);
        }
        description = bits.join(' ').substr(0, 800);
        var row = {
          'Job Title': titleEl ? titleEl.innerText.trim() : '',
          'Company': orgEl ? orgEl.innerText.trim() : '',
          'Company Website': siteEl ? siteEl.href : '',
          'Job Type': jobType,
          'Location 1': loc1,
          'Location 2': loc2,
          'Date Posted': datePosted,
          'Description': description
        };
        var columns = ['Job Title','Company','Company Website','Job Type','Location 1','Location 2','Date Posted','Description'];
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
