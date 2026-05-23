import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('s3k4c5r', 'Extract Careers SEEK Explore', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Target URL', {
      inText: Custom('Enter SEEK explore-careers URL (e.g. https://www.seek.com.au/career-advice/explore-careers)'),
      outText: Message('target_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-courses-seek-business.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Explore Page', {
      inBrowserId: Message('browser_id'), inUrl: Message('target_url'),
      optStealthMode: true, outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Cards', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/career-advice/role/")]'),
      optTimeout: Custom('30')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Roles', {
      inPageId: Message('page_id'),
      func: `
        var cards = document.querySelectorAll('a[href*="/career-advice/role/"]');
        var rows = [];
        var seen = {};
        var pos = 0;
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          var href = c.href;
          if (seen[href]) continue;
          seen[href] = true;
          var lines = (c.innerText || '').split('\\n');
          var role = '';
          var salary = '';
          for (var j = 0; j < lines.length; j++) {
            var t = lines[j].replace(/^\\s+|\\s+$/g, '');
            if (!role && t.length > 0 && t.toLowerCase() !== 'typical salary' && t.toLowerCase() !== 'satisfaction') {
              role = t;
            }
            if (!salary && /^\\$/.test(t)) {
              salary = t;
            }
          }
          if (!role) continue;
          var img = c.querySelector('img');
          var imgSrc = img ? img.src : '';
          pos++;
          rows.push({
            'Position': '#' + pos,
            'Role Name': role,
            'Typical Salary': salary,
            'Image': imgSrc
          });
        }
        var columns = ['Position','Role Name','Typical Salary','Image'];
        return JSON.stringify({columns:columns,rows:rows});
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'), inTable: Message('table'),
      optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
