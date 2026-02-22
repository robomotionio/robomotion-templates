import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('7b10b842-fb2b-4fc9-97dd-12c58afaa813', 'Amazon S3 Quick Start', (f) => {
  f.node('0522bc', 'Core.Flow.Comment', 'Comment', {
    optText: '## Amazon S3 Quick Start\n\nThis template uses *Amazon S3* nodes for object operations on Amazon S3 Bucket.\n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Amazon S3 package icon, install it.\n\n**3.** Edit the Config Node.\n\n**4.** Set the msg.uploadpath and msg.downloadpath fields to the full path file.\nupload to bucket. Set the msg.objectname field to name of object that will upload.\nSet the msg.bucketname to your s3 bucket name. Set the endpoint to your bucket\'s endpoint.\n\n**5.** Set the Access Key Id and Secret Key Access credentials for access to s3 bucket.'
  });
  f.node('b61787', 'Core.Trigger.Inject', 'Inject', {})
    .then('05ef03', 'Core.Programming.Function', 'Config', {
    func: 'msg.endpoint = \'fra1.digitaloceanspaces.com\'; // Endpoint of bucket\nmsg.uploadpath = \'C:/Users/user/Desktop/bucket-test/test.txt\'; // Path of file that will upload to bucket\nmsg.downloadpath = \'C:/Users/user/Desktop/bucket-test/test.txt\'; // Path of file that will download from bucket\nmsg.bucketname = \'test-bucket\'; // Name of bucket\nmsg.objectname = \'test.txt\'; // Name of object\nreturn msg;'
  })
    .then('6a3b32', 'Robomotion.AmazonS3.Connect', 'Connect', {
    inEndPoint: Message('endpoint'),
    outClientId: Message('client_id')
  })
    .then('8b4464', 'Robomotion.AmazonS3.UploadObject', 'Upload Object', {
    inBucketName: Message('bucketname'),
    inClientID: Message('client_id'),
    inFilePath: Message('uploadpath'),
    inObjectName: Message('objectname'),
    optContentType: Custom('')
  })
    .then('f8a0da', 'Robomotion.AmazonS3.GetObject', 'Get Object', {
    inBucketName: Message('bucketname'),
    inClientID: Message('client_id'),
    inObjectName: Message('objectname'),
    outResult: Message('result')
  })
    .then('6a67b5', 'Robomotion.AmazonS3.DownloadObject', 'Download Object', {
    inBucketName: Message('bucketname'),
    inClientID: Message('client_id'),
    inFilePath: Message('downloadpath'),
    inObjectName: Message('objectname')
  })
    .then('57b5ab', 'Robomotion.AmazonS3.DeleteObject', 'Delete Object', {
    inBucketName: Message('bucketname'),
    inClientID: Message('client_id'),
    inObjectName: Message('objectname'),
    inVersionId: Custom('')
  })
    .then('12eb9a', 'Core.Flow.Stop', 'Stop', {});
}).start();
