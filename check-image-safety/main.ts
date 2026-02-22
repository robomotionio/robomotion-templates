import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('e74e08ef-0e11-4480-8712-a197ad64e757', 'Check Image Safety', (f) => {
  f.node('13919e', 'Core.Flow.Comment', 'Comment', {
    optText: '## Check Image Safety\n\nThis template uses *Google Vision* nodes for checking an image\'s safety and returns adult, medical, racy, spoof, violence rates from 0 to 5 (0-Unknown, 1-very unlikely and 5-very likely).\n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Google Vision package icon, install it.\n\n**3.** You need to service account and enable vision api for your project to test this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Go to Vaults and create new document item with this json key.\n\n**6.** Set this vault item to Connect node credentials.\n\n**7.** Set the path of image to Check Image Safety node\'s Path field.'
  });
  f.node('4f422a', 'Core.Trigger.Inject', 'Start', {})
    .then('eda855', 'Robomotion.GoogleVision.Connect', 'Connect', { outVisionId: Message('vision_client_id') })
    .then('8c6f27', 'Robomotion.GoogleVision.CheckImageSafety', 'Check Image Safety', {
    inPath: Custom('C:/Users/user/Desktop/safetytest.jpg'),
    inVisionClientID: Message('vision_client_id'),
    result: Message('result')
  })
    .then('d5a168', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
}).start();
