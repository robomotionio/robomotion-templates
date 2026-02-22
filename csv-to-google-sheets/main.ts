import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('00229a5b-86ee-48fa-a50e-66e969c240da', 'CSV to Google Sheets', (f) => {
  f.node('d15aab', 'Core.Flow.Comment', 'Comment', {
    optText: '## CSV to Google Sheets\nThis template uses *CSV* and *Google Sheets* nodes for read range from a CSV file and write it to Google Sheet file. \n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see CSV and Google Sheets package icons, install them.\n\n**3.** You need to service account to use this template, see [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts) for service accounts.\n\n**4.** You need to key of service account as json, see [here](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-create-console) for create keys.\n\n**5.** Google Sheets API have to be enabled in project which has the service account that you created, see [here](https://support.google.com/googleapi/answer/6158841?hl=en) for enable APIs.\n\n**6.** Go to Vaults and create new document item with this json key.\n\n**7.** Set this vault item to Open Spreadsheet node credentials.\n\n**8.** Open an empty Google Spreadsheet file.\n\n**9.** Edit the Config Node.\n\n**NOTE:** Click [here](https://docs.robomotion.io/getting-started/tutorials/google-packages-interaction) for more detailed information about the service account.'
  });
  f.node('8df6d5', 'Core.Trigger.Inject', 'Start', {})
    .then('d91ef2', 'Core.Programming.Function', 'Config', {
    func: 'msg.csv_path = \'C:/example.csv\'; // [Required] CSV file path you want to convert.\nmsg.separator = \',\'; // [Required] - [, or ;]\nmsg.spreadsheet_url = \'\'; // [Required] URL of empty Google Sheets file.\nreturn msg;'
  })
    .then('835452', 'Core.Flow.SubFlow', 'Read CSV', { subflow: '0cc6a7fd-4f9a-46b4-9bec-174f151bcf29' })
    .then('dd1474', 'Core.Flow.SubFlow', 'Write Spreadsheet', { subflow: 'f86959a2-a4e3-4561-9c7a-b88a1e6e8ca8' })
    .then('6832b2', 'Core.Flow.Stop', 'Stop', {});
}).start();
