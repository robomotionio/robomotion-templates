import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('o2p3q4r', 'Extract Course Details Udemy', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Course URL', {
      inText: Custom('Enter Udemy course URL (e.g. https://www.udemy.com/course/python-bootcamp/)'),
      outText: Message('course_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `
        msg.csv_path = global.get('$Home$') + '/extract-course-details-udemy.csv';
        return msg;
      `
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      optMaximized: true,
      outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Course Page', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('course_url'),
      outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Title', {
      inPageId: Message('page_id'),
      inSelector: Custom('//h1'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Course Details', {
      inPageId: Message('page_id'),
      func: `
        var h1 = document.querySelector('h1');
        var title = h1 ? h1.innerText.trim() : '';
        var bodyTxt = document.body.innerText;
        var instructorM = bodyTxt.match(/Created by\\s+([^\\n]+)/i) || bodyTxt.match(/Instructor[s]?[:\\s]+([^\\n]+)/i);
        var instructor = instructorM ? instructorM[1].trim().substring(0,60) : '';
        var ratingM = bodyTxt.match(/Rating:\\s*([0-9]\\.[0-9]+)|([0-9]\\.[0-9]+)\\s*out of 5/i);
        var rating = ratingM ? (ratingM[1] || ratingM[2]) : '';
        var reviewsM = bodyTxt.match(/([0-9,]+)\\s*(?:total )?ratings?/i);
        var totalReviews = reviewsM ? reviewsM[1] : '';
        var priceM = bodyTxt.match(/[£$€][0-9,.]+/);
        var price = priceM ? priceM[0] : '';
        var columns = ['Course Title','Instructor','Rating','Total Reviews','Price'];
        var rows = [{'Course Title':title,'Instructor':instructor,'Rating':rating,'Total Reviews':totalReviews,'Price':price}];
        return JSON.stringify({ columns: columns, rows: rows });
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'),
      inTable: Message('table'),
      optEncoding: 'utf8',
      optSeparator: 'comma',
      optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id')
    })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
