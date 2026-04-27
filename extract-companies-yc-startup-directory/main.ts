import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-4444-4555-a666-777788889999';

const ycCompaniesFlow = flow.create(FLOW_ID, 'Extract YC Startup Directory', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### YC Startup Directory\nLoads https://www.ycombinator.com/companies, scrapes the visible cards, and writes Company, Batch, Location, Tags to `<Home>/yc-companies.csv`.\n\nNote: only the first ~40 cards are loaded by default; this template grabs that initial page. Schedule for full pagination via scroll.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('d3fbf4', 'Core.Browser.Open', 'Open Browser', {
            optBrowser: 'chrome',
            optMaximized: true,
            outBrowserId: Message('browser_id')
        })
        .then('92c2b0', 'Core.Browser.OpenLink', 'Navigate', {
            inBrowserId: Message('browser_id'),
            inUrl: Custom('https://www.ycombinator.com/companies'),
            outPageId: Message('page_id')
        })
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Cards', {
            inPageId: Message('page_id'),
            inSelector: Custom('a[href*="/companies/"] [class*="_coName"]'),
            inSelectorType: 'css',
            optTimeout: Custom('20')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Companies', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Company', 'Batch', 'Location', 'Tags'];
                var rows = [];
                var cards = document.querySelectorAll('a[href*="/companies/"]');
                for (var i = 0; i < cards.length; i++) {
                    var c = cards[i];
                    var nameEl = c.querySelector('[class*="_coName"]');
                    if (!nameEl) continue;
                    var name = nameEl.innerText.trim();
                    var locEl = c.querySelector('[class*="_coLocation"]');
                    var loc = locEl ? locEl.innerText.trim() : '';
                    var pills = c.querySelectorAll('[class*="_tagLink"]');
                    var batch = pills.length > 0 ? pills[0].innerText.trim() : '';
                    var tags = [];
                    for (var j = 1; j < pills.length; j++) {
                        tags.push(pills[j].innerText.trim());
                    }
                    rows.push({
                        'Company': name,
                        'Batch': batch,
                        'Location': loc,
                        'Tags': tags.join(', ')
                    });
                }
                return JSON.stringify({ columns: columns, rows: rows });
            `,
            outResult: Message('table_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                msg.table = JSON.parse(msg.table_json);
                msg.csv_path = global.get('$Home$') + '/yc-companies.csv';
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

ycCompaniesFlow.start();
