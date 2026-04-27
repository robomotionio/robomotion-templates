import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('r9s0t1', 'Extract Product Detail Page Trendyol', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Product URL', {
      inText: Custom('Enter Trendyol product URL (e.g. https://www.trendyol.com/seller/product-name-p-12345)'),
      outText: Message('product_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-product-detail-page-trendyol.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Product Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('product_url'),
      outPageId: Message('page_id')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Details', {
      inPageId: Message('page_id'),
      func: `
        var bodyTxt = document.body.innerText;
        var productEl = document.querySelector('h1');
        var product = productEl ? productEl.innerText.trim() : '';
        if (!product) { var m = bodyTxt.match(/^([^\\n]{10,200})/m); if (m) product = m[1]; }
        var priceEls = document.querySelectorAll('[class*="prc"]');
        var price = '';
        for (var i=0;i<priceEls.length;i++) { var t = priceEls[i].innerText.trim(); if (/[0-9]+[.,][0-9]+ TL/.test(t)) { price = t.split('\\n')[0]; break; } }
        if (!price) { var pm = bodyTxt.match(/([0-9.]+(?:[.,][0-9]+)?) TL/); if (pm) price = pm[0]; }
        var totalReviews = '';
        var totalRating = '';
        var rnrM = bodyTxt.match(/([0-9.]+)\\s*\\/\\s*5[^\\n]*([0-9]+)\\s*Değerlendirme/);
        if (!rnrM) rnrM = bodyTxt.match(/([0-9.]+)\\s*\\/\\s*5/);
        if (rnrM) totalRating = rnrM[1] + '/5';
        var reviewM = bodyTxt.match(/([0-9,]+)\\s*Değerlendirme/);
        if (reviewM) totalReviews = reviewM[1];
        var materialM = bodyTxt.match(/(?:Malzeme|Kumaş)[:\\s]+([^\\n]+)/i);
        var material = materialM ? materialM[1].trim().substring(0, 100) : '';
        var columns = ['Product','Price','Total Reviews','Total Rating','Rate Score','Material'];
        var rows = [{ 'Product': product, 'Price': price, 'Total Reviews': totalReviews, 'Total Rating': totalRating, 'Rate Score': '', 'Material': material }];
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
