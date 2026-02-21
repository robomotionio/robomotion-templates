import { flow, Message, Custom } from '@robomotion/sdk';

const FLOW_ID = 'b1cc3fe3-241e-40fd-8b75-af47a38b6b9b';

const duckDuckGoFlow = flow.create(FLOW_ID, 'DuckDuckGo Scraper', (f) => {;

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('d25a94', 'Core.Dialog.InputBox', 'Get Query', {
            inTitle: Custom('DuckDuckGo Search'),
            inText: Custom('Enter your search query:'),
            outText: Message('query')
        })
        .then('d3fbf4', 'Core.Browser.Open', 'Open Browser', {
            optBrowser: 'chrome',
            optMaximized: true,
            outBrowserId: Message('browser_id')
        })
        .then('92c2b0', 'Core.Browser.OpenLink', 'Navigate', {
            inBrowserId: Message('browser_id'),
            inUrl: Custom('https://duckduckgo.com'),
            outPageId: Message('page_id')
        })
        .then('9f9204', 'Core.Browser.TypeText', 'Type Query', {
            inPageId: Message('page_id'),
            inSelector: Custom('//*[@id="searchbox_input"]'),
            inSelectorType: 'xpath:position',
            inText: Message('query')
        })
        .then('f4a190', 'Core.Browser.ClickElement', 'Search', {
            inPageId: Message('page_id'),
            inSelector: Custom('//body/div/div/div/main/article/div[1]/div[1]/div[2]/div/header/div/section[2]/div/form/div/div[3]/button'),
            inSelectorType: 'xpath:position'
        })
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Results', {
            inPageId: Message('page_id'),
            inSelector: Custom('article[data-testid="result"]'),
            inSelectorType: 'css',
            optTimeout: Custom('10')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Results', {
            inPageId: Message('page_id'),
            func: `
                var results = [];
                var elements = document.querySelectorAll('article[data-testid="result"]');
                elements.forEach(function(el) {
                    var titleEl = el.querySelector('h2 a');
                    if (titleEl) {
                        results.push({
                            Title: titleEl.innerText,
                            Link: titleEl.href
                        });
                    }
                });
                return JSON.stringify({ columns: ['Title', 'Link'], rows: results });
            `,
            outResult: Message('table_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Parse Results', {
            func: `
                msg.table = JSON.parse(msg.table_json);
                msg.excel_path = global.get('$Home$') + '/results.xlsx';
                return msg;
            `
        })
        .then('b8306c', 'Core.Excel.Create', 'Create Excel', {
            inPath: Message('excel_path'),
            optOverwrite: true,
            outFileDescriptor: Message('excel_fd')
        })
        .then('5a7688', 'Core.Excel.SetRange', 'Write Results', {
            inFileDescriptor: Message('excel_fd'),
            inStartCell: Custom('A1'),
            inTable: Message('table'),
            optHeader: true,
            optTarget: 'specific-cell'
        })
        .then('f12128', 'Core.Excel.Save', 'Save Excel', {
            inFileDescriptor: Message('excel_fd')
        })
        .then('9528f0', 'Core.Browser.Close', 'Close Browser', {
            inBrowserId: Message('browser_id')
        })
        .then('9262e8', 'Core.Flow.Stop', 'Stop', {});
});

duckDuckGoFlow.start();
