import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a1b2c3d4-e5f6-4789-a012-345678901abc';

const hackerNewsFlow = flow.create(FLOW_ID, 'Extract Hacker News Front Page', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### Hacker News Front Page Scraper\nNavigates to https://news.ycombinator.com/, extracts every front-page submission (Position, News Title, News Link, Source) into a Data Table, and writes the result to `<Home>/hn-front-page.csv`.\n\nJust run the flow.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('d3fbf4', 'Core.Browser.Open', 'Open Browser', {
            optBrowser: 'chrome',
            optMaximized: true,
            outBrowserId: Message('browser_id')
        })
        .then('92c2b0', 'Core.Browser.OpenLink', 'Navigate', {
            inBrowserId: Message('browser_id'),
            inUrl: Custom('https://news.ycombinator.com/'),
            outPageId: Message('page_id')
        })
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Stories', {
            inPageId: Message('page_id'),
            inSelector: Custom('tr.athing.submission'),
            inSelectorType: 'css',
            optTimeout: Custom('10')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Stories', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position', 'News Title', 'News Link', 'Source'];
                var rows = [];
                var trs = document.querySelectorAll('tr.athing.submission');
                trs.forEach(function(tr) {
                    var rankEl = tr.querySelector('span.rank');
                    var titleEl = tr.querySelector('.titleline > a');
                    var siteEl = tr.querySelector('.sitestr');
                    var rank = rankEl ? rankEl.innerText.replace(/\\.$/, '') : '';
                    rows.push({
                        'Position': '#' + rank,
                        'News Title': titleEl ? titleEl.innerText.trim() : '',
                        'News Link': titleEl ? titleEl.href : '',
                        'Source': siteEl ? siteEl.innerText.trim() : ''
                    });
                });
                return JSON.stringify({ columns: columns, rows: rows });
            `,
            outResult: Message('table_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                msg.table = JSON.parse(msg.table_json);
                msg.csv_path = global.get('$Home$') + '/hn-front-page.csv';
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

hackerNewsFlow.start();
