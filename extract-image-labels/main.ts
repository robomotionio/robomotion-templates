import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('30ae56cf-bf66-452c-92f0-1fb314b4f4ab', 'Extract Image Labels', (f) => {
  f.node('c431f3', 'Core.Flow.Comment', 'Comment', {
    optText: '## Extract Image Labels\nThis template uses *Google Vision* nodes for extracting labels of image. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Google Vision package icon, install it.\n\n**3.** You need to service account to test this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Go to Vaults and create new document item with this json key.\n\n**6.** Set this vault item to connect node credentials.\n\n**7.** Set the Extract Image Labels node\'s Path input to the local path of image.\n'
  });
  f.node('91d5a8', 'Core.Trigger.Inject', 'Inject', {})
    .then('7bbc6e', 'Robomotion.GoogleVision.Connect', 'Connect', { outVisionId: Message('vision_client_id') })
    .then('e22910', 'Robomotion.GoogleVision.ExtractImageLabels', 'Extract Image Labels', {
    inPath: Custom('C:/Users/user/Desktop/labeltest.jfif'),
    inVisionClientID: Message('vision_client_id'),
    result: Message('result')
  })
    .then('3b9dd4', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
}).start();
