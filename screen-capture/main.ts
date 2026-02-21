import { flow, Message } from '@robomotion/sdk';

flow.create('32ae6638-fb64-4cd1-94f9-0cdf061c4951', 'Imported Screen Capture', (f) => {
  f.node('0814b6', 'Core.Flow.Comment', 'Comment', { optText: '# Screenshot How-To\n\nThis template uses the *Browser > Screenshot* node to take a screenshot of a web page.\n\n## Usage Steps\n\n### 1. Edit the Config Node\n\nClick on the Config Node to open the settings panel.\n\n### 2. Set the Web Page URL\n\nSet the `msg.url` field to the webpage you want to capture. For example: `https://www.example.com`\n\n### 3. Set the Download Path\n\nSet the `msg.downloadPath` field to the full filepath where you want to save the captured image file. For example: `/Users/username/Downloads/screenshot.png` or `C:\\Users\\username\\Downloads\\screenshot.png`\n\n## Result\n\nWhen the flow is executed, the template will open the specified webpage and save a screenshot to your designated file path.' });
  f.node('ff9e8c', 'Core.Trigger.Inject', 'Start', {})
    .then('543aec', 'Core.Programming.Function', 'Config', { func: '// The URL of the page containing the image you want to get\nmsg.url = "https://www.robomotion.io/";\n\n// Enter the full path of the screenshot you want to get\n//msg.downloadPath = "C:\\\\Users\\\\John\\\\screenshot.png"\nmsg.downloadPath = "/Users/.../screenshot.png"\n\nreturn msg;\n' })
    .then('d82383', 'Core.Browser.Open', 'Open Browser', {})
    .then('e30a4f', 'Core.Browser.OpenLink', 'Open Link', { inUrl: Message('url') })
    .then('74ec65', 'Core.Browser.Screenshot', 'Take \nScreenshot', { inSaveFilePath: Message('downloadPath') })
    .then('c204c1', 'Core.Flow.Stop', 'Stop', {});
}).start();