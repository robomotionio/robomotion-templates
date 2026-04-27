import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'c3d4e5f6-a7b8-4901-c234-56789012345a';

const hnSearchFlow = flow.create(FLOW_ID, 'Extract Hacker News Search Results', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### Hacker News Keyword Search Scraper\nPrompts for a keyword, runs Algolia HN search at hn.algolia.com (past week, stories) and writes every result to `<Home>/hn-search.csv` with columns Position, News Title, News Source, Date, News Link, Total Comments.\n\nJust run the flow and enter your keyword when prompted.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('a3c001', 'Core.Dialog.InputBox', 'Get Keyword', {
            inTitle: Custom('Hacker News Keyword Search'),
            inText: Custom('Enter a keyword to search Hacker News:'),
            outText: Message('keyword')
        })
        .then('b1c002', 'Core.Programming.Function', 'Build URL', {
            func: `
                msg.search_url = 'https://hn.algolia.com/?q=' + encodeURIComponent(msg.keyword) + '&dateRange=pastWeek&type=story';
                msg.csv_path = global.get('$Home$') + '/hn-search.csv';
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
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Stories', {
            inPageId: Message('page_id'),
            inSelector: Custom('article.Story'),
            inSelectorType: 'css',
            optTimeout: Custom('15')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Stories', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position', 'News Title', 'News Source', 'Date', 'News Link', 'Total Comments'];
                var rows = [];
                var stories = document.querySelectorAll('article.Story');
                for (var i = 0; i < stories.length; i++) {
                    var s = stories[i];
                    var titleA = s.querySelector('.Story_title a');
                    var linkA = s.querySelector('.Story_title a.Story_link');
                    var metaSpans = s.querySelectorAll('.Story_meta a');
                    var titleText = '';
                    if (titleA) {
                        var sp = titleA.querySelector('span');
                        titleText = (sp ? sp.innerText : titleA.innerText).trim();
                    }
                    var newsLink = linkA ? linkA.href : (titleA ? titleA.href : '');
                    var source = '';
                    if (newsLink) {
                        var m = newsLink.match(/^https?:\\/\\/([^\\/]+)/);
                        source = m ? m[1].replace(/^www\\./, '') : '';
                    }
                    var dateText = metaSpans.length >= 3 ? metaSpans[2].innerText.trim() : '';
                    var commentsText = metaSpans.length >= 4 ? metaSpans[3].innerText.trim() : '';
                    var commentsNum = '';
                    var cm = commentsText.match(/(\\d+)/);
                    commentsNum = cm ? cm[1] : '0';
                    rows.push({
                        'Position': '#' + (i + 1),
                        'News Title': titleText,
                        'News Source': source,
                        'Date': dateText,
                        'News Link': newsLink,
                        'Total Comments': commentsNum
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

hnSearchFlow.start();
