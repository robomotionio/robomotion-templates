import { flow, Message, Custom } from '@robomotion/sdk';

const myFlow = flow.create('7ef0a17b-e4da-4b67-8019-b65f98c6d90f', 'Imported Consolidate Excel Reports', (f) => {
  f.addDependency('Robomotion.MicrosoftOutlook', '0.5.2');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Consolidate Excel Reports\n\nCombines rows from multiple Excel workbooks in a folder into one consolidated sheet. A reporting helper that removes repetitive copy-paste work.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('a10002', 'Core.Programming.Function', 'Init Combined', {
      func: `var fixtures = global.get('$Home$') + '/templates/excel-automation/consolidate-excel-reports/fixtures';
msg.fixtures_dir = fixtures;
msg.combined_table = null;
msg.output_path = fixtures + '/Consolidated Report.csv';
return msg;`,
    })
    .then('a10020', 'Core.Flow.SubFlow', 'Get Excel Files Details', {})
    .then('a10003', 'Core.Programming.Function', 'Validate List', {
      outputs: 2,
      func: `return (msg.file_list && msg.file_list.length && msg.recipient_email) ? [msg, null] : [null, msg];`,
    });

  f.node('a10004', 'Core.Flow.GoTo', 'Enter Loop', {
    optNodes: { type: 'goto', ids: ['a10010'], all: false },
  });

  f.node('a10010', 'Core.Flow.Label', 'Loop Start', {})
    .then('a10011', 'Core.Programming.ForEach', 'For Each File', {
      optInput: Message('file_list'),
      optOutput: Message('current_file'),
    });

  f.node('a10021', 'Core.Flow.SubFlow', 'Read and Append', {})
    .then('a10012', 'Core.Flow.GoTo', 'Loop Back', {
      optNodes: { type: 'goto', ids: ['a10010'], all: false },
    });

  f.node('a10029', 'Core.Programming.Function', 'Serialize Combined CSV', {
    func: `var h = msg.combined_table.headers;
var body = msg.combined_table.rows.map(function(r){ return h.map(function(k){ return r[k]; }).join(','); }).join('\\n');
msg.consolidated_csv = h.join(',') + '\\n' + body + '\\n';
return msg;`,
  })
    .then('a10030', 'Core.FileSystem.WriteFile', 'Write Consolidated CSV', {
      inPath: Message('output_path'),
      inText: Message('consolidated_csv'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10031', 'Core.Programming.Function', 'Build Attachments', {
      func: `msg.attachments = [msg.output_path];
msg.retry_count = 0;
return msg;`,
    })
    .then('a10040', 'Core.Flow.GoTo', 'Enter Retry', {
      optNodes: { type: 'goto', ids: ['a10041'], all: false },
    });

  f.node('a10041', 'Core.Flow.Label', 'Retry Send', {})
    .then('a10032', 'Robomotion.MicrosoftOutlook.SendMail', 'Send Email', {
      to: Message('recipient_email'),
      subject: Custom('Consolidated Excel report from a desktop flow'),
      body: Custom('Hi,\n\nPlease find the report attached.\n\n-Robomotion for desktop'),
      attachment: Message('attachments'),
      isBodyHtml: false,
      replyAllMode: false,
    })
    .then('a10033', 'Core.Programming.Function', 'Build Done Text', {
      func: `msg.dialog_text = 'The consolidated file has been saved in ' + msg.output_path + ' and emailed to ' + msg.recipient_email;
return msg;`,
    })
    .then('a10034', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Flow run successful'),
      inText: Message('dialog_text'),
      optType: 'info',
    });

  f.node('a10050', 'Core.Trigger.Catch', 'Catch Send Errors', {
    optNodes: { type: 'catch', all: false, ids: ['a10032'] },
  })
    .then('a10051', 'Core.Programming.Function', 'Check Retry', {
      outputs: 2,
      func: `if ((msg.retry_count || 0) < 1) { msg.retry_count = (msg.retry_count || 0) + 1;
return [msg, null]; } return [null, msg];`,
    });

  f.node('a10052', 'Core.Programming.Sleep', 'Wait 5s', {
    optDuration: Custom(5),
  })
    .then('a10053', 'Core.Flow.GoTo', 'Retry Send', {
      optNodes: { type: 'goto', ids: ['a10041'], all: false },
    });

  f.node('a10098', 'Core.Flow.Stop', 'Stop Fail', { optSuccess: 'failed', optReason: Custom('Outlook.SendMail failed after 1 retry') });
  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10011', 0, 'a10021', 0);
  f.edge('a10011', 1, 'a10029', 0);
  f.edge('a10034', 0, 'a10099', 0);
  f.edge('a10051', 0, 'a10052', 0);
  f.edge('a10051', 1, 'a10098', 0);
});

myFlow.start();
