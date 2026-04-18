import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Read and Append', (f) => {
  f.node('c10001', 'Core.Flow.Begin', 'Begin', {})
    .then('c10002', 'Core.FileSystem.ReadFile', 'Load Current CSV', {
      inPath: Message('current_file'),
      optBase64: false,
      outContent: Message('current_csv_text'),
    })
    .then('c10003', 'Core.Programming.Function', 'Parse And Append', {
      func: `var lines = msg.current_csv_text.split(/\\r?\\n/).filter(function(l){ return l.length > 0; });
var headers = lines[0].split(',');
var rows = lines.slice(1).map(function(l){ var c = l.split(','); var r = {}; for (var i=0;i<headers.length;i++){ r[headers[i]] = isNaN(Number(c[i])) ? c[i] : Number(c[i]); } return r; });
if (!msg.combined_table) {
  msg.combined_table = { headers: headers, rows: rows };
} else {
  msg.combined_table.rows = msg.combined_table.rows.concat(rows);
}
return msg;`,
    })
    .then('c10099', 'Core.Flow.End', 'End', { sfPort: 0 });
});
