import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-9999-4aaa-a111-222233334444';

const htmlScreenshotFlow = flow.create(FLOW_ID, 'Extract HTML and Screenshot From Webpage', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### HTML + Screenshot Extractor\nPrompts for a URL, fetches it via HTTP (timing the request), saves the HTML to `<Home>/page.html`, opens it in Chrome to capture a full-page screenshot at `<Home>/page.png`, and writes a single-row CSV to `<Home>/page-extract.csv` with columns URL, HTML Size, Content Type, Load Time, File Size.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('a3c001', 'Core.Dialog.InputBox', 'Get URL', {
            inTitle: Custom('HTML + Screenshot Extractor'),
            inText: Custom('Enter a webpage URL:'),
            outText: Message('target_url')
        })
        .then('b1c002', 'Core.Programming.Function', 'Init', {
            func: `
                msg.req_headers = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36' };
                msg.html_path = global.get('$Home$') + '/page.html';
                msg.png_path = global.get('$Home$') + '/page.png';
                msg.csv_path = global.get('$Home$') + '/page-extract.csv';
                msg.t0 = Date.now();
                return msg;
            `
        })
        .then('41c003', 'Core.Net.HttpRequest', 'Fetch HTML', {
            optMethod: 'get',
            optUrl: Message('target_url'),
            inHeaders: Message('req_headers'),
            inCustomHeaders: [],
            outBody: Message('html_body'),
            outStatus: Message('status'),
            outHeaders: Message('resp_headers'),
            optTimeout: 60
        })
        .then('41c004', 'Core.Programming.Function', 'Compute Metadata', {
            func: `
                var ms = Date.now() - msg.t0;
                msg.load_time = (ms / 1000).toFixed(1) + 's';
                var html = String(msg.html_body || '');
                var bytes = 0;
                try { bytes = unescape(encodeURIComponent(html)).length; } catch (e) { bytes = html.length; }
                msg.html_size = (bytes / 1024).toFixed(0) + ' KB';
                msg.content_type = (msg.resp_headers && (msg.resp_headers['content-type'] || msg.resp_headers['Content-Type'])) || 'text/html';
                if (msg.content_type.indexOf(';') >= 0) msg.content_type = msg.content_type.split(';')[0].trim();
                return msg;
            `
        })
        .then('41c005', 'Core.FileSystem.WriteFile', 'Save HTML', {
            inPath: Message('html_path'),
            inText: Message('html_body'),
            optMode: 'truncate'
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
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                msg.table = {
                    columns: ['URL', 'HTML Size', 'Content Type', 'Load Time', 'File Size'],
                    rows: [{
                        'URL': msg.target_url,
                        'HTML Size': msg.html_size,
                        'Content Type': msg.content_type,
                        'Load Time': msg.load_time,
                        'File Size': msg.html_size
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

htmlScreenshotFlow.start();
