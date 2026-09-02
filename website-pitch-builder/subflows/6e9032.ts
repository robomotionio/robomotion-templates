import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Shoot The Page', (f) => {
  f.node('708192', 'Core.Flow.Begin', 'Begin', {})
    .then('81a2c3', 'Core.Programming.Function', 'Window Size', { func: '\nmsg.browser_options = { \'window-size\': \'1280,1000\' };\nreturn msg;\n' })
    .then('92b3d4', 'Core.Browser.Open', 'Open Browser', { optMaximized: false })
    .then('a3c4e5', 'Core.Browser.OpenLink', 'Open The Page', { inUrl: Message('page_url'), optTimeout: 60 })
    .then('b4d5f6', 'Core.Programming.Sleep', 'Wait For The Photographs', { optDuration: Custom('8') })
    .then('c5e607', 'Core.Browser.Screenshot', 'Screenshot', { inSaveFilePath: Message('screenshot_path'), outPath: Message('shot_path') })
    .then('d6f718', 'Core.Browser.Close', 'Close Browser', {})
    .then('e70829', 'Core.Flow.End', 'Page Shot', { sfPort: 0 });
});