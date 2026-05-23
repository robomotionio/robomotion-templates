import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('g4h5i6j', 'Extract Integrations Pipedream', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.page_url = 'https://pipedream.com/apps';
        msg.csv_path = global.get('$Home$') + '/extract-integrations-pipedream.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Pipedream Apps', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('page_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait App Cards Loaded', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/apps/node") or contains(@href,"/apps/slack") or contains(@href,"/apps/github")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Apps', {
      inPageId: Message('page_id'),
      func: `
        var bodyTxt = document.body.innerText;
        var allLinks = document.querySelectorAll('a[href*="/apps/"]');
        var columns = ['Position','Name','Description','Logo','Link'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < allLinks.length; i++) {
          var link = allLinks[i];
          var href = (link.href||'').split('?')[0];
          if (!href || seen[href]) continue;
          var slug = href.replace(/.*\\/apps\\//,'').replace(/\\/$/,'');
          if (!slug || slug.length < 1 || slug.indexOf('/') >= 0) continue;
          seen[href] = true;
          var txt = (link.innerText||link.textContent||'').trim();
          var lines = txt.split('\\n').filter(function(l){return l.trim();});
          var name = lines[0] || slug;
          var desc = lines.length > 1 ? lines[1] : '';
          if (!name || name.length < 1) name = slug;
          var img = link.querySelector('img') || document.querySelector('img[alt="'+name+'"]');
          rows.push({ 'Position': '#'+(rows.length+1), 'Name': name.substring(0,50), 'Description': desc.substring(0,200), 'Logo': img?img.src:'', 'Link': href });
        }
        if (rows.length === 0) {
          rows.push({'Position':'#debug', 'Name': bodyTxt.substring(0,200).replace(/\\n/g,' '), 'Description':'', 'Logo':'', 'Link': location.href});
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
