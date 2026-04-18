import { flow, Message, Custom } from '@robomotion/sdk';

const scriptTemplate = [
  'Dim Word',
  'Dim WordDoc',
  'Dim i',
  'Set Word = CreateObject("Word.Application")',
  '',
  "'Open the document",
  'Set WordDoc = Word.Documents.Open(${WORD_PATH})',
  '',
  "'Read the document",
  'NumberOfWords = WordDoc.Sentences.Count',
  'For i = 1 to NumberOfWords',
  '    WScript.Echo WordDoc.Sentences(i)',
  'Next',
  '',
  "'Close the document",
  'WordDoc.Close False',
  'Word.Quit',
  '',
  "'Release the object variables",
  'Set WordDoc = Nothing',
  'Set Word = Nothing',
].join('\n');

const myFlow = flow.create('13ddd484-1a0a-4ef2-b3d0-b71f6c0ae7da', 'Imported Extract Text from Word Document', (f) => {
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Extract Text from Word Document\n\nUses a VBScript bridge to pull raw text out of a .docx file for downstream NLP or search indexing.' });

  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a11000', 'Core.Flow.SubFlow', 'Download Fixtures', {})
    .then('5355dc', 'Core.Programming.Function', 'Build Default Path', {
      func: `var fixtures = global.get('$Home$') + '/templates/scripting/extract-text-from-word-document/fixtures'; msg.fixtures_dir = fixtures; msg.sample_docx = fixtures + '/sample.docx'; return msg;`,
    })
    .then('a10002', 'Core.Dialog.InputBox', 'Ask Document', {
      inTitle: Custom('Extract text from Word document'),
      inText: Custom('Select the Word document to extract text from:'),
      optDefault: Message('sample_docx'),
      outText: Message('word_doc_path'),
    })
    .then('a10003', 'Core.Programming.Function', 'Validate', {
      outputs: 2,
      func: `if (!msg.word_doc_path || !/\\.docx?$/i.test(msg.word_doc_path)) return [null, msg]; var p = msg.word_doc_path; var lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\\\')); msg.script_path = p.substring(0, lastSlash) + '\\\\_extract.vbs'; return [msg, null];`,
    });

  f.node('a10004', 'Core.Programming.Function', 'Build Script', {
    func: `var tpl = ${JSON.stringify(scriptTemplate)}; msg.vbs_body = tpl.replace('\${WORD_PATH}', '"' + msg.word_doc_path.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '""') + '"'); return msg;`,
  })
    .then('a10005', 'Core.FileSystem.WriteFile', 'Write VBS', {
      inPath: Message('script_path'),
      inText: Message('vbs_body'),
      optBase64: false,
      optMode: 'truncate',
    })
    .then('a10006', 'Core.Programming.Function', 'Build Args', {
      func: `msg.vbs_args = ['//Nologo', msg.script_path]; return msg;`,
    })
    .then('a10007', 'Core.Process.StartProcess', 'Run VBScript', {
      inFilePath: Custom('cscript'),
      inArguments: Message('vbs_args'),
      optBackground: false,
      outStdout: Message('vbs_output'),
    })
    .then('a10008', 'Core.FileSystem.Delete', 'Cleanup Script', {
      inPath: Message('script_path'),
      continueOnError: true,
    })
    .then('a10009', 'Core.Programming.Function', 'Trim Output', {
      func: `var s = String(msg.vbs_output || ''); var start = 0; var end = s.length; while (start < end && (s.charCodeAt(start) === 10 || s.charCodeAt(start) === 13 || s.charCodeAt(start) === 32 || s.charCodeAt(start) === 9)) start++; while (end > start && (s.charCodeAt(end - 1) === 10 || s.charCodeAt(end - 1) === 13 || s.charCodeAt(end - 1) === 32 || s.charCodeAt(end - 1) === 9)) end--; msg.trimmed_text = s.substring(start, end); return msg;`,
    })
    .then('a10010', 'Core.Dialog.MessageBox', 'Show Output', {
      inTitle: Custom('Extracted text:'),
      inText: Message('trimmed_text'),
      optType: 'info',
    });

  f.node('a10099', 'Core.Flow.Stop', 'Stop', {});

  f.edge('a10003', 0, 'a10004', 0);
  f.edge('a10003', 1, 'a10099', 0);
  f.edge('a10010', 0, 'a10099', 0);
});

myFlow.start();
