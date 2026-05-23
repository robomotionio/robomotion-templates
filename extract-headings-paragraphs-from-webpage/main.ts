import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-8888-4999-a000-111122223333';

const headingsParagraphsFlow = flow.create(FLOW_ID, 'Extract Headings and Paragraphs From Webpage', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### Headings, Paragraphs, and Images Extractor\nPrompts for a URL, loads it in Chrome, then writes Position, IMG, H1, H3, P columns to `<Home>/page-content.csv`. Each row aligns the i-th IMG / H1 / H3 / P found on the page (blank when that list runs out).\n\nUseful for SEO heading audits and content migration.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('a3c001', 'Core.Dialog.InputBox', 'Get URL', {
            inTitle: Custom('Webpage Content Extractor'),
            inText: Custom('Enter a webpage URL:'),
            outText: Message('target_url')
        })
        .then('b1c002', 'Core.Programming.Function', 'Build CSV Path', {
            func: `
                msg.csv_path = global.get('$Home$') + '/page-content.csv';
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
            inUrl: Message('target_url'),
            outPageId: Message('page_id')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Content', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position', 'IMG', 'H1', 'H3', 'P'];
                function texts(sel) {
                    var arr = [];
                    var nodes = document.querySelectorAll(sel);
                    for (var i = 0; i < nodes.length; i++) {
                        var t = (nodes[i].innerText || '').replace(/\\s+/g, ' ').trim();
                        if (t) arr.push(t);
                    }
                    return arr;
                }
                function srcs(sel) {
                    var arr = [];
                    var nodes = document.querySelectorAll(sel);
                    for (var i = 0; i < nodes.length; i++) {
                        var s = nodes[i].src || nodes[i].getAttribute('data-src') || '';
                        if (s && s.indexOf('data:') !== 0) arr.push(s);
                    }
                    return arr;
                }
                var imgs = srcs('img');
                var h1s = texts('h1');
                var h3s = texts('h3');
                var ps = texts('p');
                var n = Math.max(imgs.length, h1s.length, h3s.length, ps.length);
                var rows = [];
                for (var i = 0; i < n; i++) {
                    rows.push({
                        'Position': '#' + (i + 1),
                        'IMG': i < imgs.length ? imgs[i] : '',
                        'H1': i < h1s.length ? h1s[i] : '',
                        'H3': i < h3s.length ? h3s[i] : '',
                        'P': i < ps.length ? ps[i] : ''
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

headingsParagraphsFlow.start();
