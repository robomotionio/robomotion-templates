import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-aaaa-4bbb-a222-333344445555';

const fullTextScreenshotFlow = flow.create(FLOW_ID, 'Extract Full Page Text + Screenshot', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### Full-Page Text + Screenshot Extractor\nPrompts for a URL, opens it in Chrome, captures a full-page screenshot to `<Home>/page.png`, pulls the page title and the rendered body innerText, and writes a single-row CSV to `<Home>/page-text.csv` with URL, Extracted Text, Screenshot, Timestamp, Page Title.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('a3c001', 'Core.Dialog.InputBox', 'Get URL', {
            inTitle: Custom('Page Text + Screenshot'),
            inText: Custom('Enter a webpage URL:'),
            outText: Message('target_url')
        })
        .then('b1c002', 'Core.Programming.Function', 'Init', {
            func: `
                msg.png_path = global.get('$Home$') + '/page.png';
                msg.csv_path = global.get('$Home$') + '/page-text.csv';
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
        .then('92c2b1', 'Core.Browser.Screenshot', 'Take Screenshot', {
            inPageId: Message('page_id'),
            inSaveFilePath: Message('png_path')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Extract Text', {
            inPageId: Message('page_id'),
            func: `
                var title = document.title || '';
                var text = (document.body ? document.body.innerText : '').replace(/\\s+/g, ' ').trim();
                return JSON.stringify({ title: title, text: text });
            `,
            outResult: Message('extract_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                var x = JSON.parse(msg.extract_json);
                var d = new Date();
                function pad(n) { return n < 10 ? '0' + n : '' + n; }
                var ts = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC';
                msg.table = {
                    columns: ['URL', 'Extracted Text', 'Screenshot', 'Timestamp', 'Page Title'],
                    rows: [{
                        'URL': msg.target_url,
                        'Extracted Text': x.text,
                        'Screenshot': msg.png_path,
                        'Timestamp': ts,
                        'Page Title': x.title
                    }]
                };
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

fullTextScreenshotFlow.start();
