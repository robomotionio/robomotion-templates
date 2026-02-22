import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('db3260e1-7df3-4ba3-adfc-3065cf055377', 'Youtube Video Stats', (f) => {
  f.node('adac7b', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Youtube Video Stats How-To \n\nThis template uses *Browser* and *Function* nodes to extract video stats from\na Youtube video.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.url field to the URL of the Youtube video you want to extract\nstats.'
  });
  f.node('7f1065', 'Core.Trigger.Inject', 'Inject', {})
    .then('d1cf0d', 'Core.Programming.Function', 'Config', {
    func: 'msg.url = \'https://youtu.be/uzkD5SeuwzM\'; // [Required]\nreturn msg;'
  })
    .then('fc8784', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  })
    .then('000ca3', 'Core.Browser.OpenLink', 'Open Youtube Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('url'),
    outPageId: Message('page_id')
  })
    .then('7cf291', 'Core.Browser.WaitElement', 'Wait Movie Player', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="movie_player"]/div[31]/div[2]/div[1]/div[1]/span[4]'),
    optCondition: 'to-appear',
    optTimeout: Custom('30')
  })
    .then('6b4b98', 'Core.Browser.GetValue', 'Get Video Duration', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="movie_player"]/div[31]/div[2]/div[1]/div[1]/span[4]'),
    inAttribute: Custom(''),
    outValue: Message('duration')
  })
    .then('caf165', 'Core.Browser.WaitElement', 'Wait Views', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="count"]/ytd-video-view-count-renderer/span[1]'),
    optCondition: 'to-appear',
    optTimeout: Custom('30')
  })
    .then('a16385', 'Core.Browser.GetValue', 'Get Views', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="count"]/ytd-video-view-count-renderer/span[1]'),
    inAttribute: Custom(''),
    outValue: Message('views')
  })
    .then('d2bbf6', 'Core.Browser.RunScript', 'Scroll Down', {
    func: 'window.scrollTo(0, 250);',
    inPageId: Message('page_id'),
    outResult: Message('result')
  })
    .then('89ae23', 'Core.Browser.WaitElement', 'Wait Buttons', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[6]/div[2]/ytd-video-primary-info-renderer/div/div/div[3]/div/ytd-menu-renderer/div'),
    optCondition: 'to-appear',
    optTimeout: Custom('30')
  })
    .then('c0ea59', 'Core.Browser.GetValue', 'Get Likes', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[6]/div[2]/ytd-video-primary-info-renderer/div/div/div[3]/div/ytd-menu-renderer/div/ytd-toggle-button-renderer[1]/a[1]/yt-formatted-string[1]'),
    inAttribute: Custom('aria-label'),
    outValue: Message('likes')
  })
    .then('a5cf78', 'Core.Browser.GetValue', 'Get Dislikes', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[6]/div[2]/ytd-video-primary-info-renderer/div/div/div[3]/div/ytd-menu-renderer/div/ytd-toggle-button-renderer[2]/a[1]/yt-formatted-string[1]'),
    inAttribute: Custom('aria-label'),
    outValue: Message('dislikes')
  })
    .then('c69999', 'Core.Browser.WaitElement', 'Wait Element', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/ytd-comments/ytd-item-section-renderer/div[1]/ytd-comments-header-renderer/div[1]/h2/yt-formatted-string/span[1]'),
    optCondition: 'to-appear',
    optTimeout: Custom('30')
  })
    .then('00119d', 'Core.Browser.GetValue', 'Get Comments', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/ytd-comments/ytd-item-section-renderer/div[1]/ytd-comments-header-renderer/div[1]/h2/yt-formatted-string/span[1]'),
    inAttribute: Custom(''),
    outValue: Message('comments')
  })
    .then('7dfb76', 'Core.Programming.Function', 'Get Stats', {
    func: 'function calculateDuration(text) {\n  const parts = text.split(\':\');\n  parts.reverse();\n  var seconds = 0;\n  for (var i = 0; i < parts.length; i++) {\n    seconds += parseInt(parts[i]) * Math.pow(60, i);\n  }\n  return seconds;\n}\n\nmsg.stats = {\n  comments: parseInt(msg.comments.replaceAll(\',\', \'\')),\n  dislikes: parseInt(msg.dislikes.split(\' \')[0].replaceAll(\',\', \'\')),\n  duration: calculateDuration(msg.duration),\n  likes: parseInt(msg.likes.split(\' \')[0].replaceAll(\',\', \'\')),\n  views: parseInt(msg.views.split(\' \')[0].replaceAll(\',\', \'\')),\n};\nreturn msg;'
  })
    .then('cb280a', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('f085ed', 'Core.Programming.Debug', 'Debug', {
    optActive: true,
    optSysConsole: false,
    optDebugData: Message('stats')
  });
}).start();
