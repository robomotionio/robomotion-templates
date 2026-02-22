import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('2c194fbe-1d26-4bcb-87f6-c0e95012df87', 'Imported Download File From web', (f) => {
  f.node('04a550', 'Core.Flow.Comment', 'Comment', { optText: '##### Download File From Web\n\nThis template downloads file from web to your computer\n\nFollow these steps to test this template;\n\n**1.** Update msg.file_url with the url of the file you want to download\n\n**2.** Update msg.download_path with the path you want to save the downloaded file\n' });
  f.node('23fd7f', 'Core.Trigger.Inject', 'Start', {})
    .then('750aa4', 'Core.Programming.Function', 'Config', { func: 'msg.file_url = "http://www.africau.edu/images/default/sample.pdf"; //[Required] The url of the file you want to download\nmsg.download_path = "C:\\\\download_file_from_web.pdf" //[Required] The path of the downloaded file for saving\nreturn msg;' })
    .then('5c822d', 'Core.Net.Download', 'Download File', {
    inUrl: Message('file_url'),
    inPath: Message('download_path'),
    optCredentials: { vaultId: '_', itemId: '_' }
  })
    .then('4b6a8e', 'Core.Programming.Function', 'Prepare Message', { func: 'msg.message = "Download Path: " + msg.download_path;\nreturn msg;' })
    .then('4a452b', 'Core.Dialog.MessageBox', 'Show Message', { inText: Message('message'), inTitle: Custom('Download Finished') })
    .then('8e6578', 'Core.Flow.Stop', 'Stop', {});
}).start();