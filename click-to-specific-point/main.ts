import { flow, Message } from '@robomotion/sdk';

flow.create('a7ff008f-8f5e-44df-b215-2b8e1035aafd', 'Click To Specific Point', (f) => {
  f.node('a1b52a', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Click To Specific Point\n\nThis template reads clipboard content and shows it in message box\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node.\n\n**2.** Update msg.x_coordinate field with the X coordinate value of the point in the screen you want to click.\n\n**3.** Update msg.y_coordinate field with the Y coordinate value of the point in the screen you want to click.\n'
  });
  f.node('21a3ac', 'Core.Trigger.Inject', 'Start', {})
    .then('cbc162', 'Core.Programming.Function', 'Config', {
    func: 'msg.x_coordinate = 250; //[Required] The x coordinate value of the point you want to click\nmsg.y_coordinate = 250; //[Required] The y coordinate value of the point you want to click\nreturn msg;'
  })
    .then('4fd5b5', 'Core.Mouse.Click', 'Click To Point', {
    inX: Message('x_coordinate'),
    inY: Message('y_coordinate'),
    optButtonType: 'left',
    optClickType: 'single-click',
    optKeyModifier: 'none'
  })
    .then('5c8051', 'Core.Flow.Stop', 'Stop', {});
}).start();
