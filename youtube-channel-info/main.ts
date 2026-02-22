import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('c42c3982-850e-4dd5-b631-405045628a54', 'Youtube Channel Information', (f) => {
  f.node('3ec6ce', 'Core.Flow.Comment', 'Comment', {
    optText: '##### YouTube Get Channel Info How-To \n\nThis template scrapes YouTube channel information and saves it to excel.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.url field with the link of YouTube Channel whose information will be scraped.\n\n**3.** Update msg.excel_path field with the path of excel that the channel information will be saved.\n'
  });
  f.node('2836f6', 'Core.Trigger.Inject', 'Inject', {})
    .then('4037a5', 'Core.Programming.Function', 'Config', {
    func: 'msg.url = \'https://www.youtube.com/c/NBA\'; // [Required] The link of YouTube Channel whose information will be scraped\nmsg.excel_path = ".//youtube_channel_details.xlsx"; // [Required] The path of excel file that the information will be saved\n\n// DO NOT EDIT BELOW\nmsg.channelLink = msg.url + \'/about\';\nreturn msg;\n'
  })
    .then('2d361d', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  })
    .then('acea9f', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('channelLink'),
    outPageId: Message('page_id')
  })
    .then('f97527', 'Core.Browser.GetValue', 'Get Channel Name', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-browse/div[3]/ytd-c4-tabbed-header-renderer/tp-yt-app-header-layout/div/tp-yt-app-header/div[2]/div[2]/div/div[1]/div/div[1]/ytd-channel-name/div/div/yt-formatted-string'),
    inAttribute: Custom(''),
    outValue: Message('channelName')
  })
    .then('d18acf', 'Core.Browser.GetValue', 'Get Num of Subs', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-browse/div[3]/ytd-c4-tabbed-header-renderer/tp-yt-app-header-layout/div/tp-yt-app-header/div[2]/div[2]/div/div[1]/div/div[1]/yt-formatted-string'),
    inAttribute: Custom(''),
    outValue: Message('numOfSubs')
  })
    .then('1470b4', 'Core.Browser.RunScript', 'Get Avatar URL', {
    func: 'function getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\nvar path = \'//yt-img-shadow[@id="avatar"]\';\nvar elem = getElementByXpath(path);\nmsg.avatarLink = elem.children[0].getAttribute("src");\nreturn msg;',
    inPageId: Message('page_id'),
    outResult: Message('result')
  })
    .then('790b58', 'Core.Browser.GetValue', 'Get Description', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('/html/body/ytd-app/div/ytd-page-manager/ytd-browse/ytd-two-column-browse-results-renderer/div[1]/ytd-section-list-renderer/div[2]/ytd-item-section-renderer/div[3]/ytd-channel-about-metadata-renderer/div[1]/div[1]/yt-formatted-string[2]'),
    inAttribute: Custom(''),
    outValue: Message('description')
  })
    .then('315e52', 'Core.Browser.GetValue', 'Get Date', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="right-column"]/yt-formatted-string[2]/span[1]'),
    inAttribute: Custom(''),
    outValue: Message('date')
  })
    .then('e69aa3', 'Core.Browser.GetValue', 'Get Views', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="right-column"]/yt-formatted-string[3]'),
    inAttribute: Custom(''),
    outValue: Message('views')
  })
    .then('408b51', 'Core.Browser.GetValue', 'Get Location', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="details-container"]/table/tbody/tr[2]/td[2]/yt-formatted-string'),
    inAttribute: Custom(''),
    outValue: Message('location')
  })
    .then('966469', 'Core.Flow.SubFlow', 'Get URLs', { subflow: 'bbbd0a85-63ed-4751-96e1-2e51519b8c89' })
    .then('9ed321', 'Core.Browser.Close', 'Close Browser', { inBrowserId: Message('browser_id') })
    .then('1fa770', 'Core.Flow.SubFlow', 'Write to Excel', { subflow: '9ef5644f-243b-47c7-a246-37408f9a7711' })
    .then('39760a', 'Core.Flow.Stop', 'Stop', {});
}).start();
