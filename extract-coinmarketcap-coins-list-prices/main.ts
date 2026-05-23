import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-3333-4444-a555-666677778888';

const cmcFlow = flow.create(FLOW_ID, 'Extract CoinMarketCap Coins List', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### CoinMarketCap Coins List\nLoads https://coinmarketcap.com/, scrapes the homepage table and writes Position, Icon, Title, Key, Price, 24h Per, 7day Perc, Market Cap, Volume 24, BTC Volume 24h, Supply Circ, Graph, Link to `<Home>/cmc-coins.csv`.\n\nJust run the flow.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('d3fbf4', 'Core.Browser.Open', 'Open Browser', {
            optBrowser: 'chrome',
            optMaximized: true,
            outBrowserId: Message('browser_id')
        })
        .then('92c2b0', 'Core.Browser.OpenLink', 'Navigate', {
            inBrowserId: Message('browser_id'),
            inUrl: Custom('https://coinmarketcap.com/'),
            outPageId: Message('page_id')
        })
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Table', {
            inPageId: Message('page_id'),
            inSelector: Custom('table tbody tr a[href*="/currencies/"]'),
            inSelectorType: 'css',
            optTimeout: Custom('20')
        })
        .then('51c003', 'Core.Browser.RunScript', 'Scroll Bottom', {
            inPageId: Message('page_id'),
            func: `window.scrollTo(0, document.body.scrollHeight); return 'ok';`,
            outResult: Message('scroll_ok')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Coins', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position','Icon','Title','Key','Price','24h Per','7day Perc','Market Cap','Volume 24','BTC Volume 24h','Supply Circ','Graph','Link'];
                var rows = [];
                var trs = document.querySelectorAll('table tbody tr');
                for (var i = 0; i < trs.length; i++) {
                    var r = trs[i];
                    var cells = r.querySelectorAll('td');
                    if (cells.length < 10) continue;
                    var posTxt = (cells[1].innerText || '').trim();
                    if (!/^\\d+$/.test(posTxt)) continue;
                    var nameP = cells[2].querySelectorAll('p');
                    var title = nameP.length > 0 ? nameP[0].innerText.trim() : '';
                    var key = nameP.length > 1 ? nameP[1].innerText.trim() : '';
                    var iconImg = cells[2].querySelector('img');
                    var icon = iconImg ? iconImg.src : '';
                    var linkA = cells[2].querySelector('a[href*="/currencies/"]');
                    var link = linkA ? linkA.href : '';
                    var price = (cells[3].innerText || '').trim();
                    var p24 = (cells[5].innerText || '').trim();
                    var p7 = (cells[6].innerText || '').trim();
                    var mcap = (cells[7].innerText || '').trim();
                    var volRaw = (cells[8].innerText || '').trim();
                    var volParts = volRaw.split(/\\s*\\n\\s*/);
                    var vol24 = volParts[0] || '';
                    var nativeVol = volParts.length > 1 ? volParts[volParts.length - 1] : '';
                    var supplyTxt = (cells[9].innerText || '').trim();
                    var graphImg = cells[cells.length - 1].querySelector('img');
                    var graph = graphImg ? graphImg.src : '';
                    rows.push({
                        'Position': '#' + posTxt,
                        'Icon': icon,
                        'Title': title,
                        'Key': key,
                        'Price': price,
                        '24h Per': p24,
                        '7day Perc': p7,
                        'Market Cap': mcap,
                        'Volume 24': vol24,
                        'BTC Volume 24h': nativeVol,
                        'Supply Circ': supplyTxt,
                        'Graph': graph,
                        'Link': link
                    });
                }
                return JSON.stringify({ columns: columns, rows: rows });
            `,
            outResult: Message('table_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                msg.table = JSON.parse(msg.table_json);
                msg.csv_path = global.get('$Home$') + '/cmc-coins.csv';
                return msg;
            `
        })
        .then('b8306c', 'Core.CSV.WriteCSV', 'Write CSV', {
            inFilePath: Message('csv_path'),
            inTable: Message('table'),
            optSeparator: 'comma',
            optHeaders: true,
            optEncoding: 'utf8'
        })
        .then('9528f0', 'Core.Browser.Close', 'Close Browser', {
            inBrowserId: Message('browser_id')
        })
        .then('9262e8', 'Core.Flow.Stop', 'Stop', {});
});

cmcFlow.start();
