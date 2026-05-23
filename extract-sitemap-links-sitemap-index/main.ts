import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-2222-4333-a444-555566667777';

const sitemapIndexFlow = flow.create(FLOW_ID, 'Extract Links From Sitemap Index', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### Sitemap Index Extractor\nFetches a `<sitemapindex>` XML, parses every `<sitemap>` entry into Position, loc, lastmod, and writes the result to `<Home>/sitemap-index.csv`.\n\nEnter the sitemap-index URL when prompted (e.g. https://www.example.com/sitemap.xml).' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('a3c001', 'Core.Dialog.InputBox', 'Get Sitemap URL', {
            inTitle: Custom('Sitemap Index Extractor'),
            inText: Custom('Enter the sitemap-index URL:'),
            outText: Message('sitemap_url')
        })
        .then('b1c002', 'Core.Programming.Function', 'Build Headers', {
            func: `
                msg.req_headers = {};
                msg.csv_path = global.get('$Home$') + '/sitemap-index.csv';
                return msg;
            `
        })
        .then('41c003', 'Core.Net.HttpRequest', 'Fetch Sitemap', {
            optMethod: 'get',
            optUrl: Message('sitemap_url'),
            inHeaders: Message('req_headers'),
            inCustomHeaders: [],
            outBody: Message('xml'),
            outStatus: Message('status'),
            optTimeout: 60
        })
        .then('a4d044', 'Core.Programming.Function', 'Parse XML', {
            func: `
                var xml = String(msg.xml || '');
                var rows = [];
                var blockRe = /<sitemap\\b[^>]*>([\\s\\S]*?)<\\/sitemap>/g;
                var locRe = /<loc>\\s*([\\s\\S]*?)\\s*<\\/loc>/i;
                var lmRe = /<lastmod>\\s*([\\s\\S]*?)\\s*<\\/lastmod>/i;
                var m, i = 0;
                while ((m = blockRe.exec(xml)) !== null) {
                    i++;
                    var block = m[1];
                    var lm = block.match(locRe);
                    var lmd = block.match(lmRe);
                    rows.push({
                        'Position': String(i),
                        'loc': lm ? lm[1].trim() : '',
                        'lastmod': lmd ? lmd[1].trim() : ''
                    });
                }
                msg.table = { columns: ['Position', 'loc', 'lastmod'], rows: rows };
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
        .then('9262e8', 'Core.Flow.Stop', 'Stop', {});
});

sitemapIndexFlow.start();
