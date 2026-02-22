import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('c11ca0c7-64e9-43bb-be00-a9471241b2e0', 'Dropbox Quick Start', (f) => {
  f.node('d47196', 'Core.Flow.Comment', 'Comment', {
    optText: '## Dropbox Quick Start\n\nThis template uses *Dropbox* nodes for showing some dropbox operations. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Dropbox package icon, install it.\n\n**3.** Edit the Config Node.\n\n**4.** Set the msg.folderName to the name of folder that you will create in dropbox.\n\n**5.** Set the msg.localUploadPath to the Path of icon to upload.\n\n**6.** Set the msg.dropboxIconPath to the Dropbox Path of icon after upload.\n\n**7.** Set the msg.localDownloadPath to the Path of icon after download.\n\n**8.** You need to a vault item that contain Dropbox API Access Token for access, see [here](http://99rabbits.com/get-dropbox-access-token/).\n\n**9.** Set your token to Connect node\'s Dropbox Token field.\n'
  });
  f.node('e0a6ed', 'Core.Trigger.Inject', 'Start', {})
    .then('2f8442', 'Core.Programming.Function', 'Function', {
    func: 'msg.folderName = "Test"; //Name of folder that will be created in your dropbox.\nmsg.localUploadPath = "C:/Users/user/Desktop/icon.png"; //Path of icon for upload operation.\nmsg.dropboxIconPath = msg.folderName + "/dropboxicon.png";// Path of icon after upload operation.\nmsg.localDownloadPath = "C:/Users/user/Desktop/dropboxicon.png"; //Path of icon after download operation.\nreturn msg;'
  })
    .then('d7f90f', 'Robomotion.Dropbox.Connect', 'Connect', { outClientID: Message('client_id') })
    .then('bc21bc', 'Robomotion.Dropbox.CreateFolder', 'Create Folder', {
    inClientID: Message('client_id'),
    inDropboxPath: Message('folderName')
  })
    .then('11def6', 'Robomotion.Dropbox.UploadFile', 'Upload File', {
    inClientID: Message('client_id'),
    inDropboxPath: Message('dropboxIconPath'),
    inFilePath: Message('localUploadPath')
  })
    .then('9aadb3', 'Robomotion.Dropbox.DownloadFile', 'Download File', {
    inClientID: Message('client_id'),
    inDropboxPath: Message('dropboxIconPath'),
    inLocalPath: Message('localDownloadPath')
  })
    .then('e3f2ee', 'Robomotion.Dropbox.FileStat', 'File Stat', {
    inClientID: Message('client_id'),
    inDropboxPath: Message('dropboxIconPath'),
    outStats: Message('stats')
  })
    .then('b4d597', 'Core.Dialog.MessageBox', 'Message Box', {
    inText: Message('stats'),
    inTitle: Custom('File Stat')
  })
    .then('983c49', 'Core.Flow.Stop', 'Stop', {});
}).start();
