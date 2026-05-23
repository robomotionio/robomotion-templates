import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('s4k5b6s', 'Extract Businesses For Sale SEEK Business', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Listings URL', {
      inText: Custom('Enter SEEK Business listings URL (e.g. https://www.seekbusiness.com.au/businesses-for-sale/all/in-Sydney+New-South-Wales)'),
      outText: Message('target_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-businesses-sale-from-seek-business.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Listings Page', {
      inBrowserId: Message('browser_id'), inUrl: Message('target_url'),
      optStealthMode: true, outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Listings', {
      inPageId: Message('page_id'),
      inSelector: Custom('//article//a[contains(@href,"/business-listing/")]'),
      optTimeout: Custom('30')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Listings', {
      inPageId: Message('page_id'),
      func: `
        var arts = document.querySelectorAll('article');
        var rows = [];
        var pos = 0;
        for (var i = 0; i < arts.length; i++) {
          var a = arts[i];
          var titleAnchor = a.querySelector('a[href*="/business-listing/"]');
          if (!titleAnchor) continue;
          var listingUrl = titleAnchor.href;
          var title = (titleAnchor.innerText || '').replace(/^\\s+|\\s+$/g, '');
          if (!title || title === 'more ››') continue;
          // Location anchors are listed before category
          var locAnchors = a.querySelectorAll('a[href*="/businesses-for-sale/in-"]');
          var locText = '';
          var locUrl = '';
          if (locAnchors.length > 0) {
            // Use the most-specific (last) location
            var lastLoc = locAnchors[locAnchors.length - 1];
            locText = (lastLoc.innerText || '').replace(/^\\s+|\\s+$/g, '');
            locUrl = lastLoc.href;
            // If multiple, prepend the first (broader area)
            if (locAnchors.length > 1) {
              var firstLoc = (locAnchors[0].innerText || '').replace(/^\\s+|\\s+$/g, '');
              if (firstLoc && firstLoc !== locText) locText = firstLoc + ', ' + locText;
            }
          }
          // Category anchors (Business Type)
          var catAnchors = a.querySelectorAll('a[href*="/businesses-for-sale/within-"]');
          var businessType = '';
          if (catAnchors.length > 0) {
            var parts = [];
            for (var c = 0; c < catAnchors.length; c++) {
              parts.push((catAnchors[c].innerText || '').replace(/^\\s+|\\s+$/g, ''));
            }
            businessType = parts.join(' > ');
          }
          // Image
          var img = a.querySelector('img');
          var imgSrc = img ? img.src : '';
          // Price + description from text
          var fullText = (a.innerText || '');
          var lines = fullText.split('\\n');
          var price = '';
          var descParts = [];
          var foundPrice = false;
          for (var L = 0; L < lines.length; L++) {
            var t = lines[L].replace(/^\\s+|\\s+$/g, '');
            if (!t) continue;
            if (!foundPrice) {
              if (/^\\$/.test(t)) { price = t; foundPrice = true; }
              continue;
            }
            // After price: collect description until "more ››", or until we hit category/action labels
            if (t.toLowerCase() === 'franchise new' || t.toLowerCase() === 'franchise resale' || t.toLowerCase() === 'private seller' || t.toLowerCase() === 'private sale' || t.toLowerCase() === 'enquire' || t.toLowerCase() === 'save') continue;
            if (businessType && (t === businessType || businessType.indexOf(t) > -1)) break;
            // strip trailing "more ››" (with possible NBSP, varying whitespace) from the line itself
            var clean = t.replace(/[\\s\\u00A0]+more[\\s\\u00A0]+\\u203A\\u203A\\s*$/, '');
            var hadMore = (clean.length !== t.length);
            if (hadMore) {
              if (clean) descParts.push(clean);
              break;
            }
            descParts.push(t);
            if (descParts.join(' ').length > 250) break;
          }
          var description = descParts.join(' ');
          pos++;
          rows.push({
            'Position': '#' + pos,
            'Listing Title': title,
            'Location': locText,
            'Price': price,
            'Business Type': businessType,
            'Description': description,
            'Listing URL': listingUrl,
            'Location URL': locUrl,
            'Image': imgSrc
          });
        }
        var columns = ['Position','Listing Title','Location','Price','Business Type','Description','Listing URL','Location URL','Image'];
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
