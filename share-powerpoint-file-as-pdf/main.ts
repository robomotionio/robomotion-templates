import { flow, Message, Custom } from '@robomotion/sdk';

// Template substituted per run: ${SRC} → PPTX path, ${DEST} → PDF path.
const exportScriptTemplate = [
  '$ErrorActionPreference = "Stop"',
  '$pptx = ${SRC}',
  '$pdf  = ${DEST}',
  '$app = New-Object -ComObject PowerPoint.Application',
  '$pres = $app.Presentations.Open($pptx, $true, $false, $false)',
  '# 32 = ppSaveAsPDF',
  '$pres.SaveAs($pdf, 32, $false)',
  '$pres.Close()',
  '$app.Quit()',
  'Write-Output "exported"',
].join('\n');

const myFlow = flow.create('e4c34dfa-6f0e-44db-9460-d54ea4766344', 'Imported Share PowerPoint File as PDF', (f) => {
  f.addDependency('Robomotion.MicrosoftOutlook', '0.5.2');

  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Share PowerPoint File as PDF\n\nOpens a .pptx file, exports it to PDF, and saves it next to the original. Automates a common office pipeline end to end.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Default Path', {
      func: `var fixtures = global.get('$Home$') + '/templates/desktop-automation/share-powerpoint-file-as-pdf/fixtures'; msg.fixtures_dir = fixtures; msg.deck_pptx = fixtures + '/deck.pptx'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask PowerPoint', {
      inTitle: Custom('Share PowerPoint as PDF'),
      inText: Custom('Please provide the path of the PowerPoint file:'),
      optDefault: Message('deck_pptx'),
      outText: Message('selected_powerpoint'),
    })
    .then('a10003', 'Core.Dialog.InputBox', 'Ask Recipient', {
      inTitle: Custom('Share PowerPoint as PDF'),
      inText: Custom('Please provide the email address of the recipient of the PDF file:'),
      optDefault: Custom('recipient@example.com'),
      outText: Message('recipient_email'),
    })
    .then('a10004', 'Core.Dialog.InputBox', 'Ask Sender', {
      inTitle: Custom('Share PowerPoint as PDF'),
      inText: Custom('Please provide your email address used on Outlook:'),
      optDefault: Custom('me@example.com'),
      outText: Message('sender_email'),
    })
    .then('a10005', 'Core.Programming.Function', 'Derive Paths', {
      outputs: 2,
      func: `if (!msg.selected_powerpoint || !/\\.pptx?$/i.test(msg.selected_powerpoint)) return [null, msg]; var p = msg.selected_powerpoint; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); var dir = p.substring(0, lastSlash); var base = p.substring(lastSlash + 1); var dot = base.lastIndexOf('.'); var stem = dot === -1 ? base : base.substring(0, dot); msg.directory = dir; msg.file_name_no_ext = stem; msg.pdf_path = dir + '/' + stem + '.pdf'; return [msg, null];`,
    });

  f.node('a10006', 'Core.Programming.Function', 'Build Export Args', {
    func: `var tpl = ${JSON.stringify(exportScriptTemplate)}; var script = tpl.replace('\${SRC}', JSON.stringify(msg.selected_powerpoint)).replace('\${DEST}', JSON.stringify(msg.pdf_path)); msg.export_args = ['-NoProfile', '-Command', script]; return msg;`,
  })
    .then('a10007', 'Core.Process.StartProcess', 'Export To PDF', {
      inFilePath: Custom('powershell'),
      inArguments: Message('export_args'),
      optBackground: false,
      outStdout: Message('export_output'),
    })
    .then('a10050', 'Core.Flow.SubFlow', 'Send Email Via Outlook', {})
    .then('a10008', 'Core.Dialog.MessageBox', 'Show Done', {
      inTitle: Custom('Done'),
      inText: Custom('PowerPoint exported and email dispatched.'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10005', 0, 'a10006', 0);
  f.edge('a10005', 1, 'a10099', 0);
  f.edge('a10008', 0, 'a10099', 0);
});

myFlow.start();
