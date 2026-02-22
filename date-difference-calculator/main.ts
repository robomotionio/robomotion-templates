import { flow, Message } from '@robomotion/sdk';

flow.create('da24ce9d-4a0d-4f89-8913-d1b8eada6722', 'Date Difference Calculator', (f) => {
  f.node('19fd02', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Date Difference Calculator How-To \n\nThis template uses *Date Time* nodes to calculate the difference between now\nand a specific date. The result is calculated in milliseconds.\n\nFollow these steps to test this template;\n\n**1.** Go to Repositories screen in Admin Console.\n\n**2.** Add [Contrib](https://packages.robomotion.io/contrib) package repository url.\n\n**3.** Go to Flow Designer and press package icon above the node palette.\n\n**4.** You should see Date Time package icon, install it.\n\n**5.** Edit the Config Node\n\n**6.** Set the `year` field to the year value.\n\n**7.** Set the `month` field to the month of year value, e.g. 5 for May.\n\n**8.** Set the `day` field to day of month value.\n\n**9.** Set the `hr` field to the hour value.\n\n**10.** Set the `min` field to the minute value.\n\n**11.** Set the `sec` field to the second value.\n\n**12.** Set the `tz` field to the timezone value, e.g. \'+03:00\' for Turkey.'
  });
  f.node('4c362f', 'Core.Trigger.Inject', 'Inject', {})
    .then('23db53', 'Core.Programming.Function', 'Config', {
    func: 'var year = 1990, // [Required]\n  month = 5, // [Required]\n  day = 12, // [Required]\n  hr = 13, // [Required]\n  min = 48, // [Required]\n  sec = 24, // [Required]\n  tz = \'+03:00\'; // [Required]\n\nmsg.start = `${year.toString().padStart(4, \'0\')}-${month.toString().padStart(2, \'0\')}-${day.toString().padStart(2, \'0\')}`;\nmsg.start += `T${hr.toString().padStart(2, \'0\')}:${min.toString().padStart(2, \'0\')}:${sec.toString().padStart(2, \'0\')}${tz}`;\nreturn msg;'
  })
    .then('e0d400', 'Robomotion.DateTime.Now', 'Now', {
    outNow: Message('end'),
    optLayout: 'RFC3339'
  })
    .then('6a2132', 'Robomotion.DateTime.Span', 'Time Span', {
    inEndDate: Message('end'),
    inStartDate: Message('start'),
    outSpan: Message('span'),
    optLayout: 'RFC3339'
  })
    .then('6dadf6', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
}).start();
