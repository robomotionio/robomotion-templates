import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('k2l3m4', 'Extract Property Details Airbnb', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Listing URL', {
      inText: Custom('Enter Airbnb listing URL (e.g. https://www.airbnb.com/rooms/20669368)'),
      outText: Message('listing_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-property-details-airbnb.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Listing', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('listing_url'),
      optStealthMode: true,
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait H1', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Details', {
      inPageId: Message('page_id'),
      func: `
        var overall = '';
        var cleanliness = '';
        var communication = '';
        var price = '';
        var reviewTexts = [];
        var allScripts = document.querySelectorAll('script');
        var bigScript = '';
        for (var i = 0; i < allScripts.length; i++) {
          var t = allScripts[i].textContent || '';
          if (t.length > bigScript.length && (t.indexOf('overallRating') >= 0 || t.indexOf('reviewsCount') >= 0)) bigScript = t;
        }
        if (bigScript) {
          var ovM = bigScript.match(/"overallRating":([0-9.]+)/);
          if (ovM) overall = ovM[1];
          var clPats = [/"cleanliness":([0-9.]+)/, /"cleanlinessRating":([0-9.]+)/, /"CLEANLINESS":[^0-9]*([0-9.]+)/];
          for (var p = 0; p < clPats.length && !cleanliness; p++) { var m = bigScript.match(clPats[p]); if (m) cleanliness = m[1]; }
          var coPats = [/"communication":([0-9.]+)/, /"communicationRating":([0-9.]+)/, /"COMMUNICATION":[^0-9]*([0-9.]+)/];
          for (var p2 = 0; p2 < coPats.length && !communication; p2++) { var m2 = bigScript.match(coPats[p2]); if (m2) communication = m2[1]; }
          var prPats = [/"displayPrice":"([^"]+)"/, /"originalPrice":\\{"amount":([0-9.]+)/, /"price":"([^"]+)"(?!.*"price")/];
          for (var p3 = 0; p3 < prPats.length && !price; p3++) { var m3 = bigScript.match(prPats[p3]); if (m3) price = m3[1]; }
          var rMs = bigScript.match(/"comments":"([^"]{40,400})"/g);
          if (rMs) {
            for (var j = 0; j < rMs.length && j < 8; j++) {
              var rm = rMs[j].match(/"comments":"([^"]+)"/);
              if (rm) reviewTexts.push(rm[1].replace(/\\\\n/g,' ').replace(/\\\\u[0-9a-f]{4}/g,' ').substring(0,300));
            }
          }
        }
        var columns = ['Overall Rating','Price','Cleanliness','Communication','Review Text'];
        var rows = [];
        if (reviewTexts.length > 0) {
          for (var k = 0; k < reviewTexts.length; k++) {
            rows.push({ 'Overall Rating': overall, 'Price': price, 'Cleanliness': cleanliness, 'Communication': communication, 'Review Text': reviewTexts[k] });
          }
        } else {
          rows.push({ 'Overall Rating': overall, 'Price': price, 'Cleanliness': cleanliness, 'Communication': communication, 'Review Text': '' });
        }
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
