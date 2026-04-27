import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('i0j1k2', 'Scrape Property Details Redfin', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Property URL', {
      inText: Custom('Enter Redfin property detail URL (e.g. https://www.redfin.com/CA/San-Jose/123-Main-St/home/12345)'),
      outText: Message('property_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/scrape-property-details-redfin.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Property Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('property_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Price', {
      inPageId: Message('page_id'),
      inSelector: Custom('//*[contains(@class,"price") and contains(.,"$")]'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Details', {
      inPageId: Message('page_id'),
      func: `
        var bodyTxt = document.body.innerText;
        var addrEl = document.querySelector('[class*="street-address"], [class*="streetAddress"], [class*="homeAddress"]');
        var address = addrEl ? addrEl.innerText.trim() : '';
        if (!address) {
          var h1 = document.querySelector('h1');
          address = h1 ? h1.innerText.trim() : '';
        }
        var priceEl = document.querySelector('[class*="statsValue"],[class*="price-section"],[data-rf-test-id*="abp-price"]');
        var price = priceEl ? priceEl.innerText.trim().split('\\n')[0] : '';
        if (!price) {
          var pm = bodyTxt.match(/^\\$[\\d,]+$/m);
          if (pm) price = pm[0];
        }
        var statsEl = document.querySelector('[class*="home-summary-stats"], [class*="vitals"]');
        var beds = '';
        var baths = '';
        var sqft = '';
        var spans = document.querySelectorAll('[class*="HomeStats"] span, [class*="stat"] span, [class*="PropertySummary"] span');
        for (var i = 0; i < spans.length; i++) {
          var t = spans[i].innerText.trim();
          if (/^[0-9\\.]+$/.test(t) || /^[0-9\\.,]+$/.test(t)) {
            var next = spans[i+1] ? spans[i+1].innerText.trim() : '';
            if (next.indexOf('Bed') >= 0 || next.indexOf('bed') >= 0) beds = t + ' bed';
            else if (next.indexOf('Bath') >= 0 || next.indexOf('bath') >= 0) baths = t + ' bath';
            else if (next.indexOf('Sq') >= 0 || next.indexOf('sq') >= 0) sqft = t + ' sq ft';
          }
        }
        var bedsM = bodyTxt.match(/([0-9\\.]+)\\s*(?:Bed|bed)/);
        if (!beds && bedsM) beds = bedsM[1] + ' bed';
        var bathsM = bodyTxt.match(/([0-9\\.]+)\\s*(?:Bath|bath)/);
        if (!baths && bathsM) baths = bathsM[1] + ' bath';
        var sqftM = bodyTxt.match(/([\\d,]+)\\s*Sq\\.?\\s*Ft/i);
        if (!sqft && sqftM) sqft = sqftM[1] + ' sq ft';
        var estimateM = bodyTxt.match(/Redfin Estimate[^\\$]*\\$([\\d,]+)/);
        var estimate = estimateM ? '$' + estimateM[1] : '';
        var yearM = bodyTxt.match(/Year Built[:\\s]*([0-9]{4})/);
        var yearBuilt = yearM ? yearM[1] : '';
        var columns = ['Field','Value'];
        var rows = [
          { 'Field': 'Address', 'Value': address },
          { 'Field': 'Price', 'Value': price },
          { 'Field': 'Beds / Baths', 'Value': beds + ' / ' + baths },
          { 'Field': 'Area-SqFt', 'Value': sqft },
          { 'Field': 'Year Built', 'Value': yearBuilt },
          { 'Field': 'Redfin Estimate', 'Value': estimate }
        ];
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
