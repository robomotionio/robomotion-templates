import { flow, Message, Custom, Credential } from '@robomotion/sdk';

// API Calls with Http Request — one node, three shapes of call.
//
// Almost every system worth automating has an API, and a flow can call one directly with
// `Core.Net.HttpRequest`. The three requests a beginner actually hits are all here, and
// they are all the same node with different properties — which is the point of the
// template: authentication is a property, not a different node, and so is a file.
//
//   Get Rates    a plain read. Method, URL, and the field the answer lands on. The reply
//                arrives as `application/json`, so the node parses it into an object
//                instead of handing back a string.
//   Sign In      the same call behind a password. Authentication is set to Basic and a
//                vault item is chosen; the node has no username box and no password box
//                at all, and the robot fetches the item itself at run time. A password
//                never appears in the flow, and it does not travel with a copy of it.
//   Post File    a call that carries a file. The `Content-Type` custom header is
//                `multipart/form-data`, and in the body an `@` in front of a path means
//                "open this file and send it as a form file part" — exactly curl's
//                at-sign. Everything without one goes as an ordinary form field, and the
//                node generates the multipart boundary itself.
//
// The three services were picked so this runs with no account anywhere: frankfurter.dev
// needs no key, postman-echo's basic-auth endpoint answers to its own published test
// pair, and httpbin.org echoes an upload back in readable pieces.
flow.create('138d77ca-d077-4d80-950a-ef6f5866c1cb', 'API Calls with Http Request', (f) => {
  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: '#### API Calls with Http Request\nOne node makes any HTTP call a flow needs, and the three shapes you will actually hit are all the same node with different properties.\n\n*Get Rates* is a plain read. *Sign In* is the same call behind a password, which is a **property** and not a different node. *Post File* carries a file, because its Content-Type says `multipart/form-data` and its body has an `@` in front of a path.\n\nRun it and open **upload** in the Debug console. That is the echo of what was actually sent.' });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n**1.** *Get Rates* needs nothing. Connect a robot and press **Run**, and the first call already works.\n\n**2.** For *Sign In*, make a **vault**: Designer > Vaults > New Vault, then **Add Item** > *Login / Password*. Username `postman`, password `password` — postman-echo\'s own published test pair.\n\n**3.** Open *Sign In* > **Credentials** and pick that item. There is nowhere else to type a password, and that is deliberate.\n\n**4.** Give the robot the vault key once: Robots > your robot > **Inject Vault Secret**. A robot keeps it in memory, so a restarted robot needs it again.\n\n**5.** For *Post File*, put a small text file where the robot can read it, and set the path in *Build Upload*:\n```\necho id,amount > /tmp/report.csv\necho 1,42 >> /tmp/report.csv\n```\n\n**6.** **Run**, then open **upload** in the Debug console: `files` holds the file\'s contents under our field name, `form` holds the field that had no at-sign, and `headers` shows the multipart boundary the node generated.' });

  f.node('ca0001', 'Core.Trigger.Inject', 'Start', {})
    // A read. GET is not the default — a new Http Request node comes set to POST — and
    // the URL is the whole address including the query string.
    .then('ca0002', 'Core.Net.HttpRequest', 'Get Rates', {
      optMethod: 'get',
      optAuthentication: 'no-authentication',
      optUrl: Custom('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP'),
      outBody: Message('rates'),
    })
    // The same call, behind a password. Basic Authentication takes a vault item and
    // nothing else: pick one in the Credentials property and the robot fetches it at run
    // time. `_` means "not chosen yet" — the Designer will ask you.
    .then('ca0004', 'Core.Net.HttpRequest', 'Sign In', {
      optMethod: 'get',
      optAuthentication: 'basic-authentication',
      optUrl: Custom('https://postman-echo.com/basic-auth'),
      optCredentials: Credential({ vaultId: '_', itemId: '_' }),
      outBody: Message('login'),
    })
    // The at-sign is the whole lesson, and it sits next to a field that does not have
    // one. `file` is opened and sent as a form file part; `note` goes as an ordinary
    // form field. Point `file` at a file that exists on the robot's machine.
    .then('ca0005', 'Core.Programming.Function', 'Build Upload', {
      func:
        "msg.body = {\n" +
        "  file: '@/tmp/report.csv',\n" +
        "  note: 'from Robomotion'\n" +
        "};\n" +
        "return msg;",
    })
    // Content-Type is the switch: `multipart/form-data` is what makes the node walk the
    // body as form parts and open the file itself. Request names the message field the
    // body is read from, and it defaults to `msg.req` — ours is called `body`.
    .then('ca0006', 'Core.Net.HttpRequest', 'Post File', {
      optMethod: 'post',
      optAuthentication: 'no-authentication',
      optUrl: Custom('https://httpbin.org/post'),
      inBody: Message('body'),
      inCustomHeaders: [
        { scope: 'Custom', name: { name: 'Content-Type', value: 'multipart/form-data' } },
      ],
      outBody: Message('upload'),
    })
    // Three answers on one message: rates, login, upload.
    .then('ca0003', 'Core.Programming.Debug', 'Debug', {});
}).start();
