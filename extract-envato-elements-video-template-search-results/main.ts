import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('n1o2p3q', 'Extract Envato Elements Video Template Search Results', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Search URL', {
      inText: Custom('Enter Envato Elements video templates URL (e.g. https://elements.envato.com/video-templates)'),
      outText: Message('search_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-envato-elements-video-template-search-results.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Envato Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('search_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Items', {
      inPageId: Message('page_id'),
      inSelector: Custom('//a[contains(@href,"/video-templates/")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Templates', {
      inPageId: Message('page_id'),
      func: `
        var links = document.querySelectorAll('a[href*="/video-templates/"]');
        var columns = ['Position','Video Template Thumbnail','Video Template Title','Creator','Video Template Link'];
        var rows = [];
        var seen = {};
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var href = link.href.split('?')[0];
          if (seen[href] || href === 'https://elements.envato.com/video-templates') continue;
          seen[href] = true;
          var title = link.getAttribute('title') || link.innerText.trim();
          if (!title || title.length < 3) {
            var card = link.parentElement;
            var titleEl = card ? card.querySelector('[class*="title"], h3, h2') : null;
            if (titleEl) title = titleEl.innerText.trim();
          }
          if (!title || title.length < 3) continue;
          var img = link.querySelector('img') || (link.parentElement ? link.parentElement.querySelector('img') : null);
          var creatorEl = link.parentElement ? link.parentElement.querySelector('[class*="author"], [class*="creator"]') : null;
          var creator = creatorEl ? creatorEl.innerText.trim() : '';
          rows.push({'Position':'#'+(rows.length+1),'Video Template Thumbnail':img?img.src:'','Video Template Title':title.substring(0,200),'Creator':creator,'Video Template Link':href});
          if (rows.length >= 24) break;
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
