import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('3ec59ac1-6be5-4cd0-a576-1b6d397eff88', 'ReCaptcha Solver', (f) => {
  f.node('745c2d', 'Core.Flow.Comment', 'Comment', {
    optText: '##### reCAPTCHA Solver How-To \n\nThis template uses [anti-captcha.com](http://www.anti-captcha.com) service \nto solve reCAPTCHA. \n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Go to anti-captcha.com, create an account get key and set the msg.clientKey\n\n**3.** Set msg.websiteURL with the URL of the page that has reCAPTCHA\n\n**4.** Set msg.websiteKey with the reCAPTCHA site key. You can find the site key\nby following this [tutorial](https://blog.deathbycaptcha.com/tutorials-guides/solving-recaptcha-v2-via-api).\n'
  });
  f.node('cce233', 'Core.Trigger.Inject', 'Start', {})
    .then('cf98f4', 'Core.Programming.Function', 'Config', {
    func: '// anti-captcha.com API Key\nmsg.clientKey="";\n\n// an example site that has reCaptcha\nmsg.websiteURL="https:\\/\\/www.google.com\\/recaptcha\\/api2\\/demo";\nmsg.websiteKey="6Le-wvkSAAAAAPBMRTvw0Q4Muexq9bi0DJwx_mJ-";\n\nreturn msg;\n'
  })
    .then('4b1aa5', 'Core.Browser.Open', 'Open Browser', {
    outBrowserId: Message('browser_id'),
    optBrowser: 'chrome',
    optMaximized: true,
    optUserDataDir: Custom(''),
    optProxyCredentials: Custom('{'vaultId': '_', 'itemId': '_'}')
  })
    .then('963683', 'Core.Browser.OpenLink', 'Open reCaptcha', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Custom('https://www.google.com/recaptcha/api2/demo'),
    outPageId: Message('page_id')
  })
    .then('15d441', 'Core.Flow.SubFlow', 'Solve reCaptcha', { subflow: 'a07920d0-bc07-44cb-a95d-713081a9f55a' })
    .then('c7536d', 'Core.Browser.ClickElement', 'Click Submit', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//*[@id="recaptcha-demo-submit"]')
  })
    .then('e2eb67', 'Core.Dialog.MessageBox', 'Success', {
    inText: Custom('Success'),
    inTitle: Custom('reCaptcha')
  })
    .then('950b85', 'Core.Flow.Stop', 'Stop', {});
}).start();
