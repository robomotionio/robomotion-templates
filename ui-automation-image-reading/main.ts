import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

// What the Image Inspector captured: the Invoices tab, and each total with its label.
const IMG_INVOICES_TAB = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAMCAIAAAB0ltMZAAABKElEQVQ4EcXBIapYURQDwNz9RERm/yoyIgsqHHhQqGpF/8xbgx/11uBHvTUAKOOswT+hvAZ/763BobwG/91bg0N5DQDK+KwBQHkNDuU1ACjjrAFAeQ0AyjhrAFDGWYNDGWcNgLcGh/IaAJTX4FBeQ3kNDuU1lNfgUF5DeQ3lNfhQXoNDeQ3lNfjNW4NDeQ0AymtwKK8BQHkN5TUAKK/BobyG8hrKa/ChjN+soQxgDT5vDQ7lNQAor8GhvAYA5TWU1wCgvAaH8hrKayivwYfyGvyBMoA1AN4aHMprAFBeg0N5DQ7lNTiU1+BQXkN5DeU1+FBeg0N5DT6U1wB4awBQxllDeQ0O5TU4lNfgQxlnDQDKawBQxlkDgDLOGgCUcdbgvDX4UW8NftQv5BvjHQodE9MAAAAASUVORK5CYII=";
const IMG_OUTSTANDING = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANcAAAATCAIAAACMZg9AAAADy0lEQVRoBe3BO65jixVDwaX57IAh5x8xZMABGRBwADXczx84uLZbVa81fH39qNcavr5+1GsNX18/6rWGr68f9VrDf6WTgTV8/WtOXsP/oNca3k7mwxr+wsnAGv7CycAa/gMnA2tOBtbw9Q+dvIbHyXxYA5zMYw2/OpkPa4CTeazh7WQea/jVyTzW8HYyjzV8eK0BTgbW8HYysIbfORlYw184GVjDf+BkYA1f/8zJPNbwdjKwhsfJwBrgZGANH04G1vA4GVgDnAysORlYA5wMrOFxMrAGOBlYczKwBjgZWMPjtQY4GVjD28nAmpOBNcDJwJqTeawBTuax5mQea4CTeawBTubDGt5O5sOak4E1J/NhDW8n82HNycAa/gAnA2tOXnPyGuBkYA2/czKwhg8nA2t4nAysAU4G1vDhZGANv3MysOZkYA1wMrCGx2sNcDKwhreTgTUnA2uAk4E1JwNreDsZWMPjZGANf+dkYM3JwBrgZGDNycAa4GRgzcnAmpOBNcDJwJqTgTXAycCak4E1/AFOBtacvIbHyTzW8DiZtzX86mQea4CTgTXAycAaHicDa/g7J/O2BjgZWAOcDKzh8VoDnAys4e1kYM3JwBrgZGDNycAa3k7msQY4GVjD42Q+rDkZWAOcDKw5GVgDnAysORlYczKwBjgZWHMysAY4GVjDH+ZkHmv41cnAGj6cDKzhd04G1pwMrAFOBtbwdjKwhr92MrDmZGANcDKwhsdrDXAysIa3k4E1JwNrgJOBNScDa3iczGPNycAa3k4G1gAnA2tOBtYAJwNrTgbWACcDa04G1pwMrAFOBtacDKwBTgbW8Oc5ec3JwBo+nAys4cPJwBp+52RgzcnAGuBkYA1wMrCGf+hkYM3JwBrgZGANj9ca4GRgDW8nA2tOBtYAJwNrTgbW8KuTgTUnA2t4OxlYA5wMrDkZWAOcDKw5GVgDnAysORlYczKwBjgZWHMysAY4GVhzMrCGP8DJa05eczKw5mRgDXAysOZkYA1wMrDmZGDNycAa4GRgzcnAGuBkYM3JwBo+nAysORlYA5wMrDkZWAOcDKzh8VrD28l8WMPbyXxYA5zM25qTeazh7WTe1gAn82HNycAa4GRgDXAyH9acDKw5GVgDnAysAU7mw5qTgTX8GU7msYa3k3ms4e1kHmuAk4E1wMk81vB2Mo81wMn8as3JwBrgZB5reDuZxxo+vNbw/+JkYA1/npPX8O87GVjDz3mt4X/cyTzW8Ec6eQ3/vpPX8KNea/j6+lGvNXx9/ajXGr6+ftRrDV9fP+pv1wqnNrzL+ecAAAAASUVORK5CYII=";
const IMG_OVERDUE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAN4AAAAmCAIAAAAkxLKUAAAFQ0lEQVR4Ae3BMY4YxxIDUE5eR+mAIe8fMWRQR6kDfKCBAUbYtWB9y6ux1O9dHeOvLQoPHWNbFB46BrAobB0vCreOsS0KW8cAFoWHjhcFoGMAiwLQMYBF4aHjRQHoeFEAOgawKAAdA1gUHjpeFICO8WdYFG4dY1sUbh1jWxRuHQNYFICOASwKt46xLQq3jgEsCt/qeFEAOgawKNw6xrYo3DrGw9UxfmuLAtAx/jyL6hg/blEAOsavc3WM39GicOsYf6RFdYwft6iO8UtdHeM43ufqGMfxPlfHOI73uTrGcbzP1TGO432ujnEc73N1jON4n6tjHMf7XB3jON7n6hjH8T5XxziO97k6xn/WojrG8bcNVTH+C66O8YUWha1j/GOL6hi/wlDYKgYwFB4qxm2oivF/Gapi/DxDVYzbUNgqxjYUtorxmaEAVAxgKDxUjG2oivHBUHioGMBQ2CrGw9UxvsqiOsa2qI7xzyyqY3y5oSrGNlTFQ1WMdxsKt4qHqhjbUBUPVTG2oSrGt4aqGJ8ZqmIAQwGoGB8MVTEehqoY21AV43Z1jC+xqI7xsKiOF9UxtkV1DGBR2DoGsKiOF9UxgEXh1vGiOsa2qI4BLApbx9gW1TF+tqEqHqpifGaoiofCrWIAQ1WMbaiKAQyFrWIAQ1UMYChsFQMYClvF2IbCVjE+M1TFQ1WMD4aqGA9DVYyHoSrGZ4aqGLehKsYHQ1WMh6EqxjZUxbhdHeNLLKpjPCyq40V1jG1RHS+qY2yL6nhRADoGsKiOsS2q40V1jG1RHS+qY2yL6hjAojrGTzVUxQCGwq1iPAxV8VAVYxuq4qEqxjZUxUNVjG2oioeqeKiKcRuqYmxDVTxUxfiuoSoeqmI8DAWgYjwMVTG+NRRuFeNhqIpxG6pifDAUbhUDGKpibENVjNvVMb7EojrGw6I6BrCojhfVMYBF4aHjRXWMbVEdY1tUx4vqGNuiOl4UHjrGv2CoivHBUBXjNlTFQ1WMbaiKAQxV8VAVAxiqYmxDVTxUxUNVjNtQeKh4KAAV47uGwlYxvjVUxdiGqhgfDFUxtqEqxjZUxXgYqmJ811AVD1UxtqEqxu3qGF9iUR3jYVEdA1hUx4vqGMCiOsbDojrGtqiOsS2q40V1jG1RHS+qY/ybhqoYnxmqYtyGqnioirENVTGAoSoeqmIAQ1WMbaiKh6p4qIpxG6pifDAUgIrx14aqeKiK8TBUxQCGqhifGapibENVjG2oivEwVMX4rqEqHqpibENVjNvVMb7KojrGtqiOcVtUx9gW1TG2RXW8qI6xLapjbIvqeFEdY1tUx4vqGNuiOgawqI7xMwxVMR6GqhjbUBXjNlTFQ1WMbaiKsQ1VMbahKsY2VMVDVTxUxbgNVTG2oSrGbaiKAQxVMT4YquKhKh6qYmxDVTxUxfjWUBUDGKpibENVDGCoivGtoSrGbaiKAQxVMbahKh6qYmxDVYzb1TG+0KKwdYyHRXWM26KwdQxgUR3jtijcOgawKNw6BrAobB1jW1TH+BmGwkPFAIbCVjEehqp4qIqxDVUxtqEqxm0obBUDGKpiAENhqxjAUNgqBjAUtoqxDVUxHobCrWJsQ2GrGMBQeKgYwFAVYxsKW8XYhqoYD0NhqxjbUBVjGwpbxdiGwlYxHq6Ocfx2hqoYHwxVMX7EUBXjy10d4/i9DFUxPjNUxfjbhqoYv8LVMY7jfa6OcRzvc3WM43ifq2Mcx/tcHeM43ufqGMfxPlfHOI73uTrGcbzP1TGO432ujnEc73N1jON4n6tjHMf7XB3jON7nf89ZqlwnXQqBAAAAAElFTkSuQmCC";

flow.create('main', "Reading over Remote Desktop", (f) => {
  f.addDependency('Robomotion.ImageAutomation', '0.12.3');
  f.node('c01000', 'Core.Flow.Comment', 'Comment', { optText: '### Reading over Remote Desktop\n\nA flow that logs on to Acme ERP over Remote Desktop, reads the outstanding and overdue totals off the Invoices screen with OCR, each anchored to its label, and writes the overdue share to a CSV file.' });

  f.node('c90001', 'Core.Trigger.Inject', 'Start', {})
    .then('c90002', 'Core.Flow.SubFlow', 'Open Acme ERP over Remote Desktop', {})
    .then('c90003', 'Robomotion.ImageAutomation.Image.ClickImage', "Open Invoices", {
      image: IMG_INVOICES_TAB,
      deltaX: 21,
      deltaY: 6,
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c90004', 'Robomotion.ImageAutomation.OCR.WaitText', "Wait for the totals", {
      inSearchText: Custom("Outstanding"),
      optTimeout: Custom("20"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c90005', 'Robomotion.ImageAutomation.OCR.GetTextNearImage', "Read Outstanding", {
      regions: [{"x": 0, "y": 10.5263, "width": 34.8837, "height": 84.2105}, {"x": 67.907, "y": 0, "width": 32.093, "height": 100}],
      image: IMG_OUTSTANDING,
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      outText: Message("outstanding")
    })
    .then('c90006', 'Robomotion.ImageAutomation.OCR.GetTextNearImage', "Read Overdue", {
      regions: [{"x": 0, "y": 0, "width": 50.9009, "height": 100}, {"x": 71.6216, "y": 26.3158, "width": 28.3784, "height": 50}],
      image: IMG_OVERDUE,
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      outText: Message("overdue")
    })
    .then('c90007', 'Core.Programming.Function', "Overdue share", {
      func: `const amount = (s) => parseFloat(String(s).replace(/[^0-9.]/g, ''));
const outstanding = amount(msg.outstanding);
const overdue = amount(msg.overdue);
msg.table = {
  columns: ['outstanding', 'overdue', 'overdue_share'],
  rows: [{ outstanding: outstanding.toFixed(2), overdue: overdue.toFixed(2),
           overdue_share: Math.round(100 * overdue / outstanding) + '%' }],
};
return msg;`
    })
    .then('c90008', 'Core.CSV.WriteCSV', "Write the file", {
      inTable: Message('table'),
      inFilePath: Custom("C:/Acme/out/acme-receivables.csv"),
      optHeaders: true
    })
    .then('c90009', 'Core.Flow.Stop', 'Stop', {})
    ;
}).start();
