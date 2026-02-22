import { flow, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('263f9b89-45d2-44ee-a3b8-d68ac50a20b8', 'Imported SSL Watch', (f) => {
  f.addDependency('Robomotion.Monitoring', '0.4.1');
  f.addDependency('Robomotion.GoogleSheets', '1.3.0');

  f.node('17a078', 'Core.Flow.Comment', 'Comment', { optText: '### SSL Watch\nUses the Monitoring package and its built in SSL node to check each domain, calculate how many days remain until expiration, and verify certificate status.\n\nYoutube Video:\nhttps://www.youtube.com/watch?v=G2Cp1nW5Plc' });
  f.node('1e22a2', 'Core.Trigger.Inject', 'Start', {})
    .then('4f83bf', 'Robomotion.GoogleSheets.OpenSpreadsheet', 'Open Spreadsheet', { inUrl: Custom('https://docs.google.com/spreadsheets/d/1bXmQP5orm0SauN7xICo7n1DNztxPoYTGZATxKyd_CbI/edit?pli=1&gid=0#gid=0'), optCredentials: Credential({ vaultId: 'ba22caf8-bdfd-42b3-a6c5-7f633bb0f8d6', itemId: '2195825d-5264-453d-825a-d8f2ef9a9a0d' }) })
    .then('aaf3c5', 'Robomotion.GoogleSheets.GetRange', 'Get Range', { optHeaders: true, optJsonify: true });
  f.node('d5384d', 'Core.Flow.Label', 'Next Domain', {});
  f.node('d81714', 'Core.Programming.ForEach', 'For Each', {
    optInput: Message('table.rows'),
    optOutput: Message('row'),
    optIndex: Message('index')
  })
    .then('0198c8', 'Robomotion.Monitoring.SSL', 'SSL', { inURL: Message('row.domain') })
    .then('ca1f14', 'Core.Programming.Function', 'Set Cell Coord', { func: 'msg.expires_in_cell = "B" + (msg.index + 2);\nmsg.valid_cell = "C" + (msg.index + 2);\nreturn msg;' })
    .then('4a1cce', 'Robomotion.GoogleSheets.SetCellValue', 'Set Expires In Value', { inCellName: Message('expires_in_cell'), inCellValue: Message('sslResult.expiresIn') })
    .then('1881e0', 'Robomotion.GoogleSheets.SetCellValue', 'Set Valid Value', { inCellName: Message('valid_cell'), inCellValue: Message('sslResult.valid') })
    .then('c4e967', 'Core.Flow.GoTo', 'Go To Next Domain', { optNodes: { ids: ['d5384d'], type: 'goto', all: false } });
  f.node('402a38', 'Core.Flow.Stop', 'Stop', {});

  f.edge('d81714', 1, '402a38', 0);
  f.edge('d5384d', 0, 'd81714', 0);
  f.edge('aaf3c5', 0, 'd81714', 0);
}).start();