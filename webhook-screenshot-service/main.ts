import { flow, Message, Custom } from '@robomotion/sdk';

// Webhook Screenshot Service — a flow that waits to be called.
//
// Every other template in this repository starts itself: a button, a schedule, a folder
// being watched. This one starts when somebody else asks it to. `Http In` gives the flow
// a public URL that Robomotion hosts for you — there is no port to open on your router
// and no tunnel to keep running — and `Http Out` answers on that same held-open request.
//
// Between the two, the robot does the thing a web service cannot do for itself: it opens
// a real Chrome, loads the page it was asked about, and photographs it. The reply is the
// PNG, attached to the response, so `curl -o shot.png` is a complete client.
//
// The Webhook URL is built out of this flow's own id and the Endpoint below it, so it
// only exists once the flow has been saved, and it dies with the project. Delete the
// flow and the address stops answering.
//
// `Delay Before` on the Screenshot node is three seconds, and it is not decoration: a
// page that is still fading in photographs half-drawn.
flow.create('073ee472-5082-4d91-8720-af9f78d2cae9', 'Webhook Screenshot Service', (f) => {
  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: '#### Webhook Screenshot Service\nAny flow can be a web service. *Http In* gives this one a public URL that Robomotion hosts for you, and *Http Out* answers on the same request.\n\nBetween them the robot does what a web server cannot: it opens a real browser, loads the page it was asked about, and photographs it.\n\nPOST a JSON body with a `url` in it, and the reply is the PNG itself.' });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n**1.** Connect a **robot** with a desktop on it: `robomotion-deskbot connect -i <email> -w <workspace> -r <robot>`. The browser opens on that machine.\n\n**2.** **Save the flow once.** The Webhook URL is built from the flow\'s own id and does not exist until it has been saved.\n\n**3.** Click *Http In* and copy the **Webhook URL** from its panel. It ends with the **Endpoint** field below it: `/shot`.\n\n**4.** **Run** the flow. It will not finish — a service flow waits for a call.\n\n**5.** Call it from any machine: `curl -X POST <webhook-url> -H \'content-type: application/json\' -d \'{"url": "https://robomotion.io"}\' -o shot.png`\n\n**6.** The URL belongs to this flow. Delete the flow and the address stops answering.' });

  // Method and Endpoint are the only two properties that decide what this service is.
  // The public Webhook URL is always exposed; IP and Port only bind a local listener as
  // well, which is useful while you are developing and unnecessary afterwards.
  f.node('a50001', 'Core.Net.HttpIn', 'Http In', {
    optMethod: 'POST',
    optEndpointV2: Custom('/shot'),
    outBody: Message('body'),
  })
    // Three lines: the page to open, the file to write it to, and the return that is a
    // Function node's whole contract. `$TempDir$` is a global the robot resolves on the
    // machine it is running on, so this works on Windows and Linux without changing.
    .then('a50002', 'Core.Programming.Function', 'Read Request', {
      func:
        "msg.url = msg.body.url;\n" +
        "msg.file = global.get('$TempDir$') + '/shot-' + msg.id + '.png';\n" +
        "return msg;",
    })
    .then('a50003', 'Core.Browser.Open', 'Open Browser', {
      optBrowser: 'chrome',
      outBrowserId: Message('browser_id'),
    })
    .then('a50004', 'Core.Browser.OpenLink', 'Open Link', {
      inBrowserId: Message('browser_id'),
      inUrl: Message('url'),
      outPageId: Message('page_id'),
    })
    // Delay Before is what makes the photograph worth having: three seconds for the page
    // to settle before the shutter. Save File Path is where it lands; Path is where the
    // node reports it landed, and that is what the response attaches.
    .then('a50005', 'Core.Browser.Screenshot', 'Screenshot', {
      inPageId: Message('page_id'),
      inSaveFilePath: Message('file'),
      outPath: Message('path'),
      delayBefore: 3,
    })
    // A browser left open is a browser still running on the robot after the caller has
    // hung up. Close it before answering.
    .then('a50006', 'Core.Browser.Close', 'Close Browser', {
      inBrowserId: Message('browser_id'),
    })
    // Attachment Path makes the file itself the body of the reply. Http Out answers the
    // request Http In is still holding open — no wire between them says so, and none is
    // needed: they are two ends of one call.
    .then('a50007', 'Core.Net.HttpOut', 'Http Out', {
      inStatus: Custom('200'),
      inAttachment: Message('path'),
    });
}).start();
