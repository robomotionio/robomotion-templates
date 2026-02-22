import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('e364f2df-e89b-45b9-ae12-b49a06f21257', 'Click Image In Screen', (f) => {
  f.node('a1b52a', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Click Image In Screen\n\nThis template searches a predefined image in the screen. If finds an image with a confidence level which is larger than specified confidence value, clicks to it.\n\nFollow these steps to test this template;\n\n**1.** Click 3 dots in *Click Image* node and then click *Capture Image* label\n\n**2.** In 5 seconds, the screenshot of the screen will be taken, and you should select the area you want to click by dragging and moving mouse.\n\n**3.** Set the confidence level of the *Click Image* node. To do that, click the node and update the confidence level property at the right of the page. It is 0.90 as default.\n'
  });
  f.node('7ab883', 'Core.Trigger.Catch', 'Catch', { optNodes: { ids: ['4d193a'], type: 'goto', all: false } })
    .then('eea0bc', 'Core.Dialog.MessageBox', 'Show Error', {
    inText: Message('error.message'),
    inTitle: Custom('Image Could\'t Found')
  });
  f.node('21a3ac', 'Core.Trigger.Inject', 'Start', {})
    .then('4d193a', 'Core.Image.Click', 'Click Image', {
    deltaX: 47,
    deltaY: 6,
    image: 'https://api.robomotion.io/v1/flows.files.get?type=image&path=flows/7be4b2fa-729c-4e83-afbd-892774f42441/images/654e3f20-74a6-403c-a5d5-6f10283afdc9.png',
    optConfidence: '0.90',
    optButtonType: 'left',
    optClickType: 'single-click',
    optKeyModifier: 'none'
  });
  f.node('e87c5b', 'Core.Flow.Stop', 'Stop', {});

  f.edge('4d193a', 0, 'e87c5b', 0);
  f.edge('eea0bc', 0, 'e87c5b', 0);
}).start();
