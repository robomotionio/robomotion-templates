import { flow, Message } from '@robomotion/sdk';

flow.create('3e9f1d0e-9ab9-454b-8c97-dcca2b1aba69', 'Extract Text From Image', (f) => {
  f.node('32a4b2', 'Core.Flow.Comment', 'Comment', {
    optText: '## Extract Text From Image\nThis template uses *Google Vision* nodes for extracting text. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Google Vision package icon, install it.\n\n**3.** You need to service account to test this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Go to Vaults and create new document item with this json key.\n\n**6.** Set this vault item to connect node credentials.\n\n**7.** Edit the config node.\n\n**8.** Set the msg.imagepath to the path of image.\n\n**9.** Set the msg.txtfilepath to the path of text file for writing result.\n'
  });
  f.node('5dcb23', 'Core.Trigger.Inject', 'Start', {})
    .then('d0204b', 'Core.Programming.Function', 'Config', {
    func: 'msg.imagepath = "C:/Users/user/Desktop/ocrimage.png"; //Path of image.\nmsg.txtfilepath = "C:/Users/user/Desktop/ocrtext.txt"; //Path of text file that will be created.\nreturn msg;'
  })
    .then('b77dd6', 'Robomotion.GoogleVision.Connect', 'Connect', { outVisionId: Message('vision_client_id') })
    .then('24b718', 'Robomotion.GoogleVision.ImageToText', 'Image To Text', {
    inPath: Message('imagepath'),
    inVisionClientID: Message('vision_client_id'),
    outConfidence: Message('confidence'),
    outText: Message('outtext')
  })
    .then('c5cfb3', 'Core.FileSystem.WriteFile', 'Write File', {
    inPath: Message('txtfilepath'),
    inText: Message('outtext'),
    optMode: 'append'
  })
    .then('ac0bdd', 'Core.Flow.Stop', 'Stop', {});
}).start();
