import { subflow, Message } from '@robomotion/sdk';

subflow.create('Connect', (f) => {
  f.node('a7c342', 'Core.Flow.Begin', 'Begin', {})
    .then('0ffb8b', 'Robomotion.GoogleDrive.Connect', 'Connect', { outDriveId: Message('drive_id') })
    .then('60813b', 'Robomotion.GoogleDrive.Upload', 'Upload File', {
    inDriveID: Message('drive_id'),
    inFilePath: Message('pdfPath'),
    inParentId: Message('parentFolderId'),
    outDriveFileId: Message('file_id')
  })
    .then('d51983', 'Core.Flow.End', 'End', { sfPort: 0 });
});
