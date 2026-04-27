import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('g6h7i8', 'Extract Project Details From Freelancer Com', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Project URL', {
      inText: Custom('Enter a Freelancer.com project URL (e.g. https://www.freelancer.com/projects/autocad/my-project)'),
      outText: Message('project_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-project-details-from-freelancer-com.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Project Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('project_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Project Title', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Project', {
      inPageId: Message('page_id'),
      func: `
        var h1El = document.querySelector('h1');
        var title = h1El ? h1El.innerText.trim() : '';
        var bodyTxt = document.body.innerText;
        var budgetM = bodyTxt.match(/[£$€][\\d,]+[\\s\\-–]+[£$€]?[\\d,]+\\s*[A-Z]{3}/);
        var budget = budgetM ? budgetM[0].trim() : '';
        if (!budget) {
          var budgetM2 = bodyTxt.match(/[£$€][\\d,]+[\\+]?\\s*[A-Z]{3}/);
          budget = budgetM2 ? budgetM2[0].trim() : '';
        }
        var bidsM = bodyTxt.match(/([0-9]+)\\s+bids?/i);
        var bids = bidsM ? bidsM[1] : '';
        var skills = [];
        var skillEls = document.querySelectorAll('[class*="TagsWidget"] a, [class*="tags"] a[href*="/jobs/"], .JobDetails-tags a, [class*="skill-tag"]');
        if (skillEls.length > 0) {
          for (var i = 0; i < skillEls.length && skills.length < 6; i++) {
            var st = skillEls[i].innerText.trim();
            if (st && st.length > 1 && st.length < 40) skills.push(st);
          }
        }
        if (skills.length === 0) {
          var skillsIdx = bodyTxt.indexOf('Project ID:');
          if (skillsIdx > 100) {
            var pre = bodyTxt.substring(Math.max(0, skillsIdx - 400), skillsIdx);
            var lines = pre.split('\\n').filter(function(s) { return s.trim() && s.trim().length < 40 && !/[0-9]/.test(s); });
            skills = lines.slice(-6).map(function(s) { return s.trim(); }).filter(Boolean);
          }
        }
        var ratingM = bodyTxt.match(/([0-9]\\.[0-9])\\s*\\n[^\\n]*\\n[^\\n]*reviews?/i);
        var employerRating = ratingM ? ratingM[1] : '';
        if (!employerRating) {
          var ratingM2 = bodyTxt.match(/About the client[\\s\\S]{0,200}?([0-9]+\\.[0-9]+)/);
          employerRating = ratingM2 ? ratingM2[1] : '';
        }
        var columns = ['Project','Budget','Bids','Skills','Employer Rating'];
        var rows = [{
          'Project': title,
          'Budget': budget,
          'Bids': bids,
          'Skills': skills.join(', '),
          'Employer Rating': employerRating
        }];
        return JSON.stringify({ columns: columns, rows: rows });
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
