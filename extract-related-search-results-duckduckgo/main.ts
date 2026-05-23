import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'b2c3d4e5-f6a7-4890-b123-456789012def';

const ddgRelatedFlow = flow.create(FLOW_ID, 'Extract DuckDuckGo Related Searches', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### DuckDuckGo Related Searches Scraper\nPrompts for a seed keyword, runs the search on duckduckgo.com, scrolls to surface the related-searches block, then extracts every related search (Position, Search Text, Search Link) into `<Home>/ddg-related.csv`.\n\nJust run the flow and enter your seed query when prompted.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('a3c001', 'Core.Dialog.InputBox', 'Get Query', {
            inTitle: Custom('DuckDuckGo Related Searches'),
            inText: Custom('Enter a seed search query:'),
            outText: Message('query')
        })
        .then('b1c002', 'Core.Programming.Function', 'Build URL', {
            func: `
                msg.search_url = 'https://duckduckgo.com/?q=' + encodeURIComponent(msg.query);
                msg.csv_path = global.get('$Home$') + '/ddg-related.csv';
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
        .then('51c003', 'Core.Browser.RunScript', 'Scroll to Bottom', {
            inPageId: Message('page_id'),
            func: `window.scrollTo(0, document.body.scrollHeight); return 'ok';`,
            outResult: Message('scroll_ok')
        })
        .then('72c004', 'Core.Browser.WaitElement', 'Wait for Related', {
            inPageId: Message('page_id'),
            inSelector: Custom('.related-searches__link'),
            inSelectorType: 'css',
            optTimeout: Custom('10')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Related', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position', 'Search Text', 'Search Link'];
                var rows = [];
                var els = document.querySelectorAll('.related-searches__link');
                for (var i = 0; i < els.length; i++) {
                    var el = els[i];
                    rows.push({
                        'Position': '#' + (i + 1),
                        'Search Text': (el.innerText || '').replace(/[\\u200B-\\u200F\\u202A-\\u202E\\uFEFF]/g, '').trim(),
                        'Search Link': el.href
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

ddgRelatedFlow.start();
