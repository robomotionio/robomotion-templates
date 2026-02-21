import { subflow, Message } from '@robomotion/sdk';

subflow.create('Read Excel', (f) => {
  f.node('9bcaa8', 'Core.Flow.Begin', 'Begin', {})
    .then('2eff7e', 'Core.Excel.Open', 'Open Excel', { inPath: Message('excel_path') })
    .then('ece4c0', 'Core.Programming.Switch', 'Switch', { optConditions: [{ scope: 'Custom', name: '' }, { scope: 'Custom', name: 'Boolean(msg.sheet_name)' }] })
    .then('f10e52', 'Core.Excel.GetRange', 'Get Range', {});
  f.node('07e20f', 'Core.Excel.SwitchSheet', 'Switch To Sheet', { inSheet: Message('sheet_name') });
  f.node('55a3aa', 'Core.Excel.Close', 'Close Excel', {})
    .then('ec8eca', 'Core.Flow.End', 'End', {});

  f.edge('ece4c0', 1, '07e20f', 0);
  f.edge('f10e52', 0, '55a3aa', 0);
  f.edge('07e20f', 0, '55a3aa', 0);
});