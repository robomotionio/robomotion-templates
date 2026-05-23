import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('b5c6d7e', 'Extract Comments Video From YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Video URL', {
      inText: Custom('Enter YouTube video URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)'),
      outText: Message('video_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-comments-video-from-youtube.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Video', {
      inBrowserId: Message('browser_id'), inUrl: Message('video_url'), outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait Comments', {
      inPageId: Message('page_id'),
      inSelector: Custom('//ytd-comment-thread-renderer | //ytd-app'),
      optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Comments', {
      inPageId: Message('page_id'),
      func: `
        var comments = [];
        var commentEls = document.querySelectorAll('ytd-comment-thread-renderer');
        if (commentEls.length > 0) {
          for (var i=0;i<commentEls.length&&comments.length<20;i++) {
            var el = commentEls[i];
            var authorEl = el.querySelector('#author-text');
            var textEl = el.querySelector('#content-text');
            var likesEl = el.querySelector('#vote-count-middle');
            var timeEl = el.querySelector('.published-time-text');
            var author = authorEl ? authorEl.innerText.trim() : '';
            var text = textEl ? textEl.innerText.trim() : '';
            var likes = likesEl ? likesEl.innerText.trim() : '';
            var time = timeEl ? timeEl.innerText.trim() : '';
            if (text) comments.push({'Position':'#'+(comments.length+1),'Author':author,'Comment':text.substring(0,300),'Likes':likes,'Date':time});
          }
        }
        var columns = ['Position','Author','Comment','Likes','Date'];
        return JSON.stringify({columns:columns,rows:comments});
      `,
      outResult: Message('table_json')
    })
    .then('777777', 'Core.Programming.Function', 'Parse Table', {
      func: `msg.table = JSON.parse(msg.table_json); return msg;`
    })
    .then('888888', 'Core.CSV.WriteCSV', 'Write CSV', {
      inFilePath: Message('csv_path'), inTable: Message('table'), optEncoding: 'utf8', optSeparator: 'comma', optHeaders: true
    })
    .then('999999', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('aaaaaa', 'Core.Flow.Stop', 'Stop', {});
}).start();
