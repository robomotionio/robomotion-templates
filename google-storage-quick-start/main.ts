import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('ddaeab12-320f-45bb-b3d1-1fb602fb4ea3', 'Google Storage Quick Start', (f) => {
  f.node('250181', 'Core.Flow.Comment', 'Comment', {
    optText: '## Google Storage Quick Start\nThis template uses *Google Storage* nodes for some bucket and object operations. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Google Storage package icon, install it.\n\n**3.** You need to service account to test this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Go to Vaults and create new document item with this json key.\n\n**6.** Set this vault item to connect node credentials.\n\n**7.** Edit the Config Node.\n'
  });
  f.node('9a1568', 'Core.Trigger.Inject', 'Start', {})
    .then('bb9cbe', 'Core.Programming.Function', 'Config', {
    func: 'msg.projectid = \'robomotion-123456\'; // Project id (Required)\nmsg.bucketname = \'robomotion-sample\'; // Google storage bucket name (Required)\nmsg.bucketlabels = {\n  \n    "label1":"value1",\n    "label2":"value2"\n  \n}; // Labels of bucket (Optional) \nmsg.path = \'C:/Users/user/Desktop/test.txt\'; // Full file path to upload (Required)\nmsg.objectname = \'test.txt\'; // Name of object (Required)\nreturn msg;'
  })
    .then('3649c2', 'Robomotion.GoogleStorage.Connect', 'Connect', {
    outGCSClientId: Message('gcs_id'),
    optCredentials: Credential({ vaultId: 'ced5299f-504b-4719-a38f-b5e1517cc640', itemId: 'e0439eca-bd4f-49c7-8abb-5352ff09c9b1' })
  })
    .then('f48925', 'Robomotion.GoogleStorage.CreateBucket', 'Create Bucket', {
    inBucketName: Message('bucketname'),
    inGcsClientID: Message('gcs_id'),
    inProjectId: Message('projectid'),
    optAccessControlType: 'Uniform',
    optLabels: Message('bucketlabels'),
    optStorageClass: 'Standard'
  })
    .then('a1b078', 'Robomotion.GoogleStorage.Upload', 'Upload File', {
    inBucketName: Message('bucketname'),
    inFilePath: Message('path'),
    inGcsClientID: Message('gcs_id'),
    outFilePath: Message('filePath'),
    optFileName: Custom(''),
    optTimeout: Custom('30')
  })
    .then('4239e1', 'Robomotion.GoogleStorage.GetBucket', 'Get Bucket', {
    inBucketName: Message('bucketname'),
    inGcsClientID: Message('gcs_id'),
    outBuckets: Message('bucket'),
    continueOnError: true
  })
    .then('bf5bcd', 'Robomotion.GoogleStorage.ListBucketObjects', 'List Bucket Objects', {
    inBucketName: Message('bucketname'),
    inGcsClientID: Message('gcs_id'),
    outList: Message('list')
  })
    .then('1c800f', 'Robomotion.GoogleStorage.DeleteObject', 'Delete Object', {
    inBucketName: Message('bucketname'),
    inGcsClientID: Message('gcs_id'),
    inObjectName: Message('objectname')
  })
    .then('04af14', 'Robomotion.GoogleStorage.DeleteBucket', 'Delete Bucket', {
    inBucketName: Message('bucketname'),
    inGcsClientID: Message('gcs_id')
  })
    .then('f7026b', 'Robomotion.GoogleStorage.ListBuckets', 'List Buckets', {
    inGcsClientID: Message('gcs_id'),
    inProjectId: Message('projectid'),
    outList: Message('list')
  })
    .then('634b18', 'Core.Flow.Stop', 'Stop', {});
}).start();
