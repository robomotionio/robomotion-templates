import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'd4e5f6a7-b8c9-4012-d345-678901234567';

const espnHeadlinesFlow = flow.create(FLOW_ID, 'Extract ESPN Top Headlines', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### ESPN Top Headlines Scraper\nNavigates to https://www.espn.com/, scrapes every headline from the homepage stack (`ul.headlineStack__list`) and writes them to `<Home>/espn-headlines.csv` with columns Position, Title, Link.\n\nJust run the flow.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('d3fbf4', 'Core.Browser.Open', 'Open Browser', {
            optBrowser: 'chrome',
            optMaximized: true,
            outBrowserId: Message('browser_id')
        })
        .then('92c2b0', 'Core.Browser.OpenLink', 'Navigate', {
            inBrowserId: Message('browser_id'),
            inUrl: Custom('https://www.espn.com/'),
            outPageId: Message('page_id')
        })
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Headlines', {
            inPageId: Message('page_id'),
            inSelector: Custom('ul.headlineStack__list a'),
            inSelectorType: 'css',
            optTimeout: Custom('15')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Headlines', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position', 'Title', 'Link'];
                var rows = [];
                var lis = document.querySelectorAll('ul.headlineStack__list > li');
                for (var i = 0; i < lis.length; i++) {
                    var a = lis[i].querySelector('a');
                    if (!a) continue;
                    var title = (a.innerText || '').replace(/\\s+/g, ' ').trim();
                    if (!title) continue;
                    rows.push({
                        'Position': '#' + (rows.length + 1),
                        'Title': title,
                        'Link': a.href
                    });
                }
                return JSON.stringify({ columns: columns, rows: rows });
            `,
            outResult: Message('table_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                msg.table = JSON.parse(msg.table_json);
                msg.csv_path = global.get('$Home$') + '/espn-headlines.csv';
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

espnHeadlinesFlow.start();
