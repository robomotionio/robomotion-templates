import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('d1e2f3g', 'Scrape App Details Zapier', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get App URL', {
      inText: Custom('Enter Zapier app integrations URL (e.g. https://zapier.com/apps/slack/integrations)'),
      outText: Message('app_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-app-details-zapier.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open App Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('app_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Content', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract App Details', {
      inPageId: Message('page_id'),
      func: `
        var h1 = document.querySelector('h1');
        var name = h1 ? h1.innerText.trim().replace(' integrations','') : '';
        var bodyTxt = document.body.innerText;
        var catM = bodyTxt.match(/Category[:\\s]+([^\\n]+)/i);
        var category = catM ? catM[1].trim() : '';
        var triggers = [];
        var actions = [];
        var trigEls = document.querySelectorAll('[class*="trigger"], [data-testid*="trigger"]');
        var actEls = document.querySelectorAll('[class*="action"], [data-testid*="action"]');
        if (trigEls.length > 0) { for (var i=0;i<Math.min(3,trigEls.length);i++) { var t = trigEls[i].innerText.trim(); if (t.length > 3 && t.length < 60) triggers.push(t); } }
        if (actEls.length > 0) { for (var i=0;i<Math.min(3,actEls.length);i++) { var t = actEls[i].innerText.trim(); if (t.length > 3 && t.length < 60) actions.push(t); } }
        var columns = ['Name','Categories','Type','Triggers or Actions Name','Time to run'];
        var rows = [{ 'Name': name, 'Categories': category, 'Type': triggers.length > 0 ? 'Trigger' : (actions.length > 0 ? 'Action' : ''), 'Triggers or Actions Name': (triggers.concat(actions)).slice(0,3).join(', '), 'Time to run': '' }];
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
