import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('16c64fd5-7235-4a4c-8d96-876d994453a8', 'Pdf Reader With OCR', (f) => {
  f.node('e63f62', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Pdf Reader with OCR How-To\n \n This template uses Tesseract, PDFBox, File System, Google Sheets and Google Drive nodes to perform operations.\n \n1. Edit Config (Function) node\n\n2. Download the sample pdf file from [here](https://github.com/robomotionio/robomotion-templates/raw/master/files/cards.pdf)\n\n3. Set the msg.pdfPath field to the path you downloaded the pdf file.\n\n4. Set the msg.outDirectory field to the path of directory where you want to extract images.\n\n5. Set the msg.parentFolderId field to the id of Google Drive folder that you want to upload file into.\n\n6. Set the msg.spreadsheetUrl field to the spreadsheet.\n\n7. Set the vault item to Connect node credentials for Google Sheets and Google Drive.\n'
  });
  f.node('a4d273', 'Core.Trigger.Inject', 'Start', {})
    .then('2c11bd', 'Core.Programming.Function', 'Config', {
    func: 'msg.pdfPath = "path_to_pdf"; // Path of pdf that you downloaded.\nmsg.outDirectory = "directory_path"; // Path of directory where images will be extracted.\nmsg.imgName = "extractedimg"; // Prefix of images that will be extracted. Don\'t edit if not required.\nmsg.parentFolderId = "your_parent_folder_id"; //Drive folder id. (Note that if service account doesn\'t have permission to edit this folder it can not upload the file)\nmsg.spreadsheetUrl = "https://docs.google.com/spreadsheets/d/document_id/"; //Url of spreadsheet.\nmsg.rownumber = 1; //Shouldn\'t edit.\nreturn msg;'
  })
    .then('c8d2eb', 'Robomotion.PDFBox.ExtractImages', 'Extract Images', {
    inPath: Message('pdfPath'),
    optPrefix: Message('imgName'),
    outDir: Message('outDirectory'),
    optExportType: 'png',
    optPassword: {}
  })
    .then('d89fb9', 'Core.FileSystem.List', 'List Directory', {
    inDirPath: Message('outDirectory'),
    inNameFilter: Message('imgName'),
    outFiles: Message('files'),
    optSort: 'ascend',
    optTop: 10
  });
  f.node('7cbe5c', 'Core.Flow.Label', 'Read', {});
  f.node('b6f06e', 'Core.Programming.ForEach', 'For Each', {
    outputs: 2,
    optInput: Message('files'),
    optOutput: Message('file')
  });
  f.node('16245f', 'Core.Flow.SubFlow', 'Upload to Google Drive', { subflow: '01e9e8c7-89ae-4fda-be8f-dcab55a878c9' })
    .then('6782c8', 'Core.Flow.Stop', 'Stop', {});
  f.node('e09d13', 'Core.Programming.Function', 'Set Image Path', {
    func: 'msg.imgPath = msg.outDirectory + msg.file.Name;\nreturn msg;'
  })
    .then('280b1d', 'Robomotion.Tesseract.ImageToText', 'Image To Text', {
    inPath: Message('imgPath'),
    inBase64: Custom(''),
    outMessage: Message('text')
  })
    .then('05585b', 'Core.Programming.Function', 'Parse Text', {
    func: 'msg.texttowrite = msg.text.split(\'Issued: \',2);\nmsg.title = msg.texttowrite[1].split(\' \');\nvar splittedStr = msg.title[1].split(\' \');\nvar txt = msg.title[0] + " " + splittedStr[0];\nmsg.cellIssued = "A" + msg.rownumber;\nmsg.cellResult = "B" + msg.rownumber;\nmsg.rownumber += 1;\nmsg.value = txt.substring(0, txt.length - 9);\nreturn msg;'
  })
    .then('039f74', 'Core.Flow.SubFlow', 'Write to Google Sheets', { subflow: '3f9a6e99-99e1-48f4-8617-539cad1190fc' })
    .then('0012fb', 'Core.Flow.GoTo', 'Go To Read', { optNodes: { ids: ['7cbe5c'], type: 'goto', all: false } });

  f.edge('d89fb9', 0, 'b6f06e', 0);
  f.edge('b6f06e', 0, 'e09d13', 0);
  f.edge('b6f06e', 1, '16245f', 0);
  f.edge('7cbe5c', 0, 'b6f06e', 0);
}).start();
