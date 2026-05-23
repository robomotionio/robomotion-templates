import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('x1y2z3a', 'Extract Channel Playlists YouTube', function (f) {
  f.node('111111', 'Core.Trigger.Inject', 'Start', {})
    .then('111112', 'Core.Dialog.InputBox', 'Get Playlists URL', {
      inText: Custom('Enter YouTube channel playlists URL (e.g. https://www.youtube.com/@Google/playlists)'),
      outText: Message('playlists_url')
    })
    .then('222222', 'Core.Programming.Function', 'Setup Vars', {
      func: `msg.csv_path = global.get('$Home$') + '/extract-channel-playlists-youtube.csv'; return msg;`
    })
    .then('333333', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome', optMaximized: true, outBrowserId: Message('browser_id')
    })
    .then('444444', 'Core.Browser.OpenLink', 'Open Playlists', {
      inBrowserId: Message('browser_id'), inUrl: Message('playlists_url'), outPageId: Message('page_id')
    })
    .then('555555', 'Core.Browser.WaitElement', 'Wait ytd-app', {
      inPageId: Message('page_id'), inSelector: Custom('//ytd-app'), optTimeout: Custom('20')
    })
    .then('666666', 'Core.Browser.RunScript', 'Extract Playlists', {
      inPageId: Message('page_id'),
      func: `
        var yd = window.ytInitialData;
        if (!yd) return JSON.stringify({columns:['Position','Title','Number of Videos','Image','Link'],rows:[]});
        var playlists = [];
        try {
          var str = JSON.stringify(yd);
          var gridItems = str.match(/"lockupViewModel":\\{[^}]*?"title":\\{"content":"([^"]+)"[^}]*?"videoCountText":"([^"]+)"/g);
          if (gridItems) {
            for (var i=0;i<gridItems.length&&playlists.length<20;i++) {
              var titleM = gridItems[i].match(/"title":\\{"content":"([^"]+)"/);
              var countM = gridItems[i].match(/"videoCountText":"([^"]+)"/);
              if (titleM) playlists.push({'Position':'#'+(playlists.length+1),'Title':titleM[1],'Number of Videos':countM?countM[1]:'',' Image':'','Link':''});
            }
          }
          if (!playlists.length) {
            var tabs = yd.contents.twoColumnBrowseResultsRenderer.tabs;
            for (var t=0;t<tabs.length;t++) {
              var tab = tabs[t].tabRenderer;
              if (!tab || !tab.selected) continue;
              var items = (((tab.content || {}).sectionListRenderer || {}).contents || []);
              for (var s=0;s<items.length;s++) {
                var grid = ((items[s].itemSectionRenderer || {}).contents || []);
                for (var g=0;g<grid.length&&playlists.length<20;g++) {
                  var pl = (grid[g].gridPlaylistRenderer || grid[g].lockupViewModel || {});
                  var ptitle = pl.title && pl.title.runs ? pl.title.runs[0].text : (pl.title && pl.title.content ? pl.title.content : '');
                  var pcount = pl.videoCountText ? (pl.videoCountText.runs ? pl.videoCountText.runs.map(function(r){return r.text;}).join('') : pl.videoCountText.simpleText) : '';
                  var pimg = pl.thumbnail ? (pl.thumbnail.thumbnails ? pl.thumbnail.thumbnails[0].url : '') : '';
                  var plid = pl.playlistId || '';
                  var plink = plid ? 'https://www.youtube.com/playlist?list=' + plid : '';
                  if (ptitle) playlists.push({'Position':'#'+(playlists.length+1),'Title':ptitle,'Number of Videos':pcount,'Image':pimg,'Link':plink});
                }
              }
            }
          }
        } catch(e) {}
        return JSON.stringify({columns:['Position','Title','Number of Videos','Image','Link'],rows:playlists});
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
