import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

const FLOW_ID = 'a0b1c2d3-5555-4666-a777-888899990000';

const ycJobsFlow = flow.create(FLOW_ID, 'Extract YC Job Postings', (f) => {

    f.node('e7c1a2', 'Core.Flow.Comment', 'Comment', { optText: '### YC Job Postings\nLoads https://www.ycombinator.com/jobs and writes Position, Job Title, Company Name, Location, Application URL to `<Home>/yc-jobs.csv`.\n\nDefault page shows the most recent ~20 postings. Just run the flow.' });

    f.node('dd39a8', 'Core.Trigger.Inject', 'Start', {})
        .then('d3fbf4', 'Core.Browser.Open', 'Open Browser', {
            optBrowser: 'chrome',
            optMaximized: true,
            outBrowserId: Message('browser_id')
        })
        .then('92c2b0', 'Core.Browser.OpenLink', 'Navigate', {
            inBrowserId: Message('browser_id'),
            inUrl: Custom('https://www.ycombinator.com/jobs'),
            outPageId: Message('page_id')
        })
        .then('aebce4', 'Core.Browser.WaitElement', 'Wait for Listings', {
            inPageId: Message('page_id'),
            inSelector: Custom('a[href*="/companies/"][href*="/jobs/"]'),
            inSelectorType: 'css',
            optTimeout: Custom('20')
        })
        .then('cbdffc', 'Core.Browser.RunScript', 'Scrape Jobs', {
            inPageId: Message('page_id'),
            func: `
                var columns = ['Position', 'Job Title', 'Company Name', 'Location', 'Application URL'];
                var rows = [];
                var lis = document.querySelectorAll('li.my-2.flex');
                for (var i = 0; i < lis.length; i++) {
                    var li = lis[i];
                    var jobA = li.querySelector('a[href*="/jobs/"][href*="/companies/"]');
                    if (!jobA) continue;
                    var jobTitle = jobA.innerText.trim();
                    var jobHref = jobA.href;
                    var coNameSpan = li.querySelector('span.block.font-bold');
                    var coName = coNameSpan ? coNameSpan.innerText.replace(/\\s*\\([A-Z]+\\d{2}\\)\\s*$/, '').trim() : '';
                    var location = '';
                    var divs = li.querySelectorAll('div.flex');
                    for (var j = 0; j < divs.length; j++) {
                        var t = divs[j].innerText.replace(/\\s+/g, ' ').trim();
                        if (t.indexOf('Full-time') === 0 || t.indexOf('Part-time') === 0 || t.indexOf('Contract') === 0 || t.indexOf('Internship') === 0) {
                            var parts = t.split(' • ');
                            location = parts.length > 0 ? parts[parts.length - 1] : '';
                            break;
                        }
                    }
                    rows.push({
                        'Position': '#' + (rows.length + 1),
                        'Job Title': jobTitle,
                        'Company Name': coName,
                        'Location': location,
                        'Application URL': jobHref
                    });
                }
                return JSON.stringify({ columns: columns, rows: rows });
            `,
            outResult: Message('table_json')
        })
        .then('a4d044', 'Core.Programming.Function', 'Build Table', {
            func: `
                msg.table = JSON.parse(msg.table_json);
                msg.csv_path = global.get('$Home$') + '/yc-jobs.csv';
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

ycJobsFlow.start();
