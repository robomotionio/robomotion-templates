import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('l9m0n1o', 'Extract Courses Topic Udemy', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Courses URL', {
      inText: Custom('Enter Udemy courses URL (e.g. https://www.udemy.com/courses/design/)'),
      outText: Message('courses_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-courses-topic-udemy.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Courses Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('courses_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Course Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/course/")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Courses', {
      inPageId: Message('page_id'),
      func: `
        var links = document.querySelectorAll('a[href*="/course/"]');
        var columns = ['Position','Course Title','Instructor','Rating','Learners'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var href = link.href.split('?')[0];
          if (seen[href] || !href.match(/\\/course\\/[a-z]/)) continue;
          seen[href] = true;
          var card = link.parentElement || link;
          var fullTxt = (card.innerText||link.innerText||'').trim();
          var lines = fullTxt.split('\\n').filter(function(l){return l.trim();});
          var title = lines[0] || '';
          if (!title || title.length < 5) continue;
          var instructor = '';
          var rating = '';
          var learners = '';
          for (var j=1;j<lines.length;j++) {
            var l = lines[j].trim();
            if (/^[0-9]+\\.[0-9]/.test(l) && !rating) rating = l;
            else if (/[0-9,]+\\s*(?:student|learner)/i.test(l) && !learners) learners = l;
            else if (!instructor && l.length > 2 && l.length < 60 && !/^[0-9]/.test(l)) instructor = l;
          }
          rows.push({'Position':'#'+(rows.length+1),'Course Title':title.substring(0,200),'Instructor':instructor,'Rating':rating,'Learners':learners});
          if (rows.length >= 30) break;
        }
        return JSON.stringify({ columns: columns, rows: rows });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
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
