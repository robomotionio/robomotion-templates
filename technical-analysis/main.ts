import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('7ad0ef2b-c2cc-4e4b-a31d-40159ab01239', 'Technical Analysis', (f) => {
  f.node('9151c6', 'Core.Flow.Comment', 'Comment', {
    optText: '#### Technical Analysis How-To\n \n This template uses *Technical Analysis* nodes for generating technical indicators and plotting them.\n \n1. Download the sample bitcoin csv file from [here](https://github.com/robomotionio/robomotion-templates/raw/master/files/bitcoin_data.csv) and place the file to a convenient path\n \n2. Download the sample buy/sell decision file from [here](https://github.com/robomotionio/robomotion-templates/raw/master/files/buy_sell_decision.csv) and place the file to a convenient path\n\n2. Edit Config (Function) node. Update the paths\n\n3. Install *Technical Analysis* package\n\n4. Run the flow and examine the output.html file.\n'
  });
  f.node('ec4a34', 'Core.Trigger.Inject', 'Inject', {})
    .then('010405', 'Core.Programming.Function', 'Config', {
    func: 'msg.bitcoin_data_path = "C:\\\\bitcoin_data.csv"; //The historical price change of the bitcoin. You can download from the link written in the instructions.\nmsg.buy_sell_path = "C:\\\\buy_sell_decision.csv";//It is the result of a strategy. We prepared for you, you can download from the link written in the instructions\nmsg.sma_path = "C:\\\\sma.csv"; //The output path of the SMA indicator that is used for the historical bitcoin data\nmsg.output_path = "C:\\\\output.html"; //The output path of the graph\nreturn msg;'
  })
    .then('8d4281', 'Robomotion.TechnicalAnalysis.Overlap', 'Overlap Indicators', {
    inPath: Message('bitcoin_data_path'),
    inIndex: Custom('date'),
    inLenght: Custom('10'),
    inIndicatorPath: Message('sma_path'),
    optIndicator: 'sma'
  })
    .then('93d142', 'Robomotion.TechnicalAnalysis.PlotCreate', 'Plot Create', {
    inPath: Message('bitcoin_data_path'),
    inDateKey: Custom('date'),
    inXTitle: Custom('Date'),
    inYTitle: Custom('Parity'),
    inName: Custom('USDT'),
    outPlotID: Message('plot_id')
  })
    .then('2d1b4c', 'Robomotion.TechnicalAnalysis.PlotLine', 'Add SMA Graph', {
    inPlotID: Message('plot_id'),
    inPath: Message('sma_path'),
    inDateKey: Custom('date'),
    inValueKey: Custom('SMA_10'),
    inName: Custom('SMA'),
    inColor: Custom('#ff0000'),
    optPlotMode: 'lines'
  })
    .then('66fcec', 'Robomotion.TechnicalAnalysis.PlotLabel', 'Plot Label', {
    inPlotID: Message('plot_id'),
    inPath: Message('buy_sell_path'),
    inDateKey: Custom('date'),
    inValueKey: Custom('value'),
    inLabelKey: Custom('text'),
    inBGColorKey: Custom('color'),
    inTextColorKey: Custom('textColor')
  })
    .then('4f7f4f', 'Robomotion.TechnicalAnalysis.PlotWrite', 'Plot Write', {
    inPlotID: Message('plot_id'),
    inOutputPath: Message('output_path')
  })
    .then('1330b1', 'Core.Flow.Stop', 'Stop', {});
}).start();
