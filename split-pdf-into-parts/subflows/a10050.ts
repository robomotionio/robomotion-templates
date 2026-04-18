import { subflow, Message, Custom } from '@robomotion/sdk';

subflow.create('Merge Chunk', (f) => {
  f.node('b10001', 'Core.Flow.Begin', 'Begin', {})
    .then('b10002', 'Core.Programming.Function', 'Build Chunk Target', {
      func: `var idx = msg.current_index; msg.chunk_paths = msg.current_chunk || []; msg.chunk_out = msg.split_output_dir + '\\\\Output Split_' + (idx + 1) + '.pdf'; return msg;`,
    })
    .then('b10003', 'Robomotion.PDFBox.Merge', 'Merge Chunk', {
      inPaths: Message('chunk_paths'),
      outPath: Message('chunk_out'),
    })
    .then('b10004', 'Core.Flow.End', 'End', { sfPort: 0 });
});
