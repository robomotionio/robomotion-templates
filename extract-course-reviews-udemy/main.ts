import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('p3q4r5s', 'Extract Course Reviews Udemy', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Course URL', {
      inText: Custom('Enter Udemy course URL (e.g. https://www.udemy.com/course/python-bootcamp/)'),
      outText: Message('course_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-course-reviews-udemy.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Course Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('course_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Reviews', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Reviews', {
      inPageId: Message('page_id'),
      func: `
        var reviewEls = document.querySelectorAll('[class*="review"], [data-purpose*="review"]');
        var columns = ['Position','Reviewer','Rating','Date','Review Text'];
        var rows = [];
        for (var i=0;i<reviewEls.length && rows.length<10;i++) {
          var el = reviewEls[i];
          var txt = (el.innerText||'').trim();
          if (txt.length < 20) continue;
          var lines = txt.split('\\n').filter(function(l){return l.trim();});
          var reviewer = lines[0] || '';
          var rating = '';
          var date = '';
          var review = '';
          for (var j=1;j<lines.length;j++) {
            var l = lines[j].trim();
            if (/^[1-5]$/.test(l) && !rating) rating = l;
            else if (/[0-9]{4}/.test(l) && !date) date = l;
            else if (l.length > 15 && !review) review = l;
          }
          if (!reviewer || !review) continue;
          rows.push({'Position':'#'+(rows.length+1),'Reviewer':reviewer,'Rating':rating,'Date':date,'Review Text':review.substring(0,300)});
        }
        if (rows.length === 0) {
          var bodyTxt = document.body.innerText;
          rows.push({'Position':'#debug','Reviewer':'','Rating':'','Date':'','Review Text':bodyTxt.substring(0,200).replace(/\\n/g,' ')});
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
