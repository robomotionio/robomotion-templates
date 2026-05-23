import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-7777-4888-a999-000011112222';

const ddgSearchFlow = flow.create(FLOW_ID, 'Scrape DuckDuckGo Search Results', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### DuckDuckGo Search Results\nPrompts for a query, runs the search on duckduckgo.com, and writes Position, Title, Description, Link plus blank Ad Title / Ad Description / Ad Link columns to `<Home>/ddg-results.csv`.\n\nDDG ad slots are populated only on a subset of queries — they remain blank when not present.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('a3c001', 'Core.Dialog.InputBox', 'Get Query', {
            inTitle: Custom('DuckDuckGo Search'),
            inText: Custom('Enter your search query:'),
            outText: Message('query')
        })
        .then('b1c002', 'Core.Programming.Function', 'Build URL', {
            func: `
                msg.search_url = 'https://duckduckgo.com/?q=' + encodeURIComponent(msg.query);
                msg.csv_path = global.get('$Home$') + '/ddg-results.csv';
                return msg;
            `
        })
        .then('d3fbf4', 'Core.Browser.Open', 'Open Browser', {
            optBrowser: 'chrome',
            optMaximized: true,
            outBrowserId: Message('browser_id')
        })
        .then('92c2b0', 'Core.Browser.OpenLink', 'Navigate', {
            inBrowserId: Message('browser_id'),
            inUrl: Message('search_url'),
            outPageId: Message('page_id')
        })
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Results', {
            inPageId: Message('page_id'),
            inSelector: Custom('article[data-testid="result"]'),
            inSelectorType: 'css',
            optTimeout: Custom('15')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Results', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position','Title','Description','Link','Ad Title','Ad Description','Ad Link'];
                var rows = [];
                var arts = document.querySelectorAll('article[data-testid="result"]');
                for (var i = 0; i < arts.length; i++) {
                    var a = arts[i];
                    var titleA = a.querySelector('h2 a');
                    var snippet = a.querySelector('[data-result="snippet"]') || a.querySelector('span[data-testid="result-snippet"]');
                    rows.push({
                        'Position': '#' + (i + 1),
                        'Title': titleA ? titleA.innerText.trim() : '',
                        'Description': snippet ? snippet.innerText.replace(/\\s+/g, ' ').trim() : '',
                        'Link': titleA ? titleA.href : '',
                        'Ad Title': '',
                        'Ad Description': '',
                        'Ad Link': ''
                    });
                }
                return JSON.stringify({ columns: columns, rows: rows });
            `,
            outResult: Message('table_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                msg.table = JSON.parse(msg.table_json);
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

ddgSearchFlow.start();
