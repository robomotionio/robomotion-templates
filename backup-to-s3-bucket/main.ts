import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('e165ab4f-33b2-4c5b-bdee-a154b2cc7f90', 'Backup To S3 Bucket', (f) => {
  f.node('6a2aed', 'Core.Flow.Comment', 'Comment', {
    optText: '## Backup Folder To S3 Bucket\nThis template uses *Compression* and *Amazon S3* nodes to backup a directory in your local system and send it to a S3 bucket as a compressed folder.\n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Compression and Amazon S3 package icons, install them.\n\n**3.** Edit the Config Node.\n\n**4.** Set the msg.targetpath field to the path of the directory you want to\ntake backup, set the zippath field to the path which you want to store zip. Set the msg.objname field to object that will upload.\nSet the msg.bucketname to your s3 bucket name. Set the endpoint to your bucket\'s endpoint.\n\n**5.** Set the Access Key Id and Secret Key Access credentials for access to s3 bucket.'
  });
  f.node('bf1f5a', 'Core.Trigger.Inject', 'Start', {})
    .then('23bbdb', 'Core.Programming.Function', 'Config', {
    func: 'msg.sourcepath = ["C:/Users/user/Desktop/bucket-test/"]; // Directory path which you want to backup (you can add more directory or file).\nmsg.zippath = \'C:/Users/user/Desktop/test.zip\'; // Filepath of zip after compression\nmsg.endpoint = \'fra1.digitaloceanspaces.com\'; // Endpoint of bucket\nmsg.bucketname = \'test-space\'; // Name of S3 bucket\nmsg.objname = \'backupfolder\'; // Name of object to upload\nreturn msg;'
  })
    .then('ebe2a9', 'Robomotion.Compression.Archive', 'Archive', {
    inSourcePath: Message('sourcepath'),
    inTargetPath: Message('zippath'),
    inArchiveType: 'Zip',
    optContinueOnError: true,
    optImplicitTopLevelFolder: true,
    optMkdirAll: true,
    optOverwriteExisting: true,
    optTarGzCompressionLevel: 'Default',
    optTarGzSingleThreaded: false
  })
    .then('42899b', 'Robomotion.AmazonS3.Connect', 'Connect', {
    inEndPoint: Message('endpoint'),
    outClientId: Message('client_id')
  })
    .then('98311f', 'Robomotion.AmazonS3.UploadObject', 'Upload Object', {
    inBucketName: Message('bucketname'),
    inClientID: Message('client_id'),
    inFilePath: Message('zippath'),
    inObjectName: Message('objname'),
    optContentType: Custom('')
  })
    .then('b1a934', 'Core.Flow.Stop', 'Stop', {});
}).start();
