import { flow, Message } from '@robomotion/sdk';

flow.create('d5e8950c-c059-4581-966a-069e6931e406', 'Website UI Tracker', (f) => {
  f.node('528817', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Web Site UI Tracker How-To\n \n This template uses *Browser* and *Slack* nodes to upload the current user interface of a web site to slack channel\n \n1. Edit Config (Function) node\n\n2. Set the slack environment by following [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration) instructions.\n\n3. Select vault and item in connect node\n\n4. Slack app must have files:write permission and app must be the member of channel that you want to upload screenshot.'
  });
  f.node('892d69', 'Core.Trigger.Inject', 'Start', {})
    .then('58c47e', 'Core.Programming.Function', 'Config', {
    func: 'msg.file_path = \'C:\\\\Users\\\\user\\\\Documents\\\\screenshot.png\'; // [Required] The path that the screenshot of the web site will be downloaded\nmsg.web_site = "https://www.robomotion.io/" //[Required] the url of a web site that you want to take screenshot and upload to slack\nmsg.channel_name = "general"; // [Optional] //The name of the slack channel that you want to upload the screnshot of a web site\nreturn msg;'
  })
    .then('f2fbb5', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true
  })
    .then('2a5b3d', 'Core.Browser.OpenLink', 'Go To Web Site', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('web_site'),
    outPageId: Message('page_id')
  })
    .then('bf6146', 'Core.Browser.Screenshot', 'Take Screenshot', {
    inPageId: Message('page_id'),
    inSaveFilePath: Message('file_path'),
    outPath: Message('path')
  })
    .then('6d055a', 'Robomotion.Slack.Connect', 'Connect', { outClientID: Message('client_id') })
    .then('aa68ad', 'Robomotion.Slack.FileUpload', 'Upload To Slack', {
    inChannelName: Message('channel_name'),
    inClientID: Message('client_id'),
    inFilePath: Message('file_path'),
    outFileId: Message('file_id')
  })
    .then('19e91b', 'Core.Flow.Stop', 'Stop', {});
}).start();
