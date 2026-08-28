import { flow, Message, Custom, Credential } from '@robomotion/sdk';

// Internship Application Intake — a form anyone can answer, on a queue only you can read.
//
// Most automation starts with something a person outside your company has to send you.
// A Robomotion form is a public web page with its own link: whoever answers it needs no
// account and installs nothing, and every submission becomes one item on a workspace
// queue. This flow is the other side of that — three nodes that take one application off
// the queue and show you what it says.
//
// The part worth understanding is the key. When you publish a form you point it at a
// queue and at an **RSA key pair** from your vault. The public half goes out with the
// page and locks each submission in the visitor's own browser, with a one time AES key
// that is itself wrapped with your public key. The private half never leaves the vault.
// So what the platform stores is ciphertext: the Admin Console can tell you an item
// arrived, what its status is and how many attempts it has had, and it cannot tell you a
// word of what the applicant wrote.
//
// Get Next Item offers "AES Key / RSA Key Pair" and the two are not interchangeable. An
// AES key is one key both ways, which is right for items a flow put on the queue itself.
// A form is the other case entirely: locked by a public half out on the internet, opened
// by a private half in here. Point this node at the same key pair the form was published
// with, or nothing comes back.
//
// A file field is not encrypted with the rest. It uploads on its own and the field ends
// up holding the address it was stored at, so `resume` arrives as a link rather than a
// file — download it with an HTTP Request node when you need the bytes.
flow.create('5e030ada-80dc-443e-b7fc-5eccdc7ba9ca', 'Internship Application Intake', (f) => {

  f.node('c50001', 'Core.Flow.Comment', 'Comment', { optText: '#### Internship Application Intake\nA published **form** collects applications from people who are not in your workspace. Every submission lands as one item on a queue called `Applications`, encrypted in the applicant\'s own browser with the public half of an RSA key pair from your vault.\n\nThese three nodes are the other side: take one application off the queue, and show what it says. The robot fetches the **private** half at run time, unwraps the one time AES key the browser made, and decrypts the body.\n\nThe platform stores ciphertext throughout. It keeps the history of every submission and can never read one.' });

  f.node('c50002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n**1.** Admin Console > Queues > **Create Queue**, name it `Applications`.\n\n**2.** Vault > **New Vault**, name it `Form Keys`. Add an item of type **RSA Key** called `Applications Key` and press the regenerate button so it mints the pair in your browser. An item saved without it holds no keys.\n\n**3.** Admin Console > Robots > your robot > **Vaults**, and grant access to `Form Keys`. Without it the robot cannot decrypt what it takes off the queue.\n\n**4.** Designer rail > **Forms** > *AI Generate*, describe the form you want, and press **Create Form**. On cloud the Robomotion provider needs no API key.\n\n**5.** **Publish** the form: pick the queue `Applications`, the vault `Form Keys` and the key `Applications Key`, choose **Permanent**, and copy the link.\n\n**6.** Answer the form yourself once, then open *Take The Next Application* and select the same key pair in the **AES Key / RSA Key Pair** property.\n\n**7.** Run the flow. The application comes back in the dev console, every field ID with what was typed beside it.' });

  // Inject starts it by hand, which is what you want while you are building it. In
  // production, put a queue trigger on `Applications` so a submission starts the flow.
  f.node('d10001', 'Core.Trigger.Inject', 'Start', {})

    // Start Transaction marks the item In Progress as it hands it over, so no second
    // robot is offered the same application. The key pair is the one the form was
    // published with — select it after you have made it.
    .then('d10002', 'Core.Queue.Get', 'Take The Next Application', {
      optQueueName: Custom('Applications'),
      optAESKey: Credential({ vaultId: '_', itemId: '_' }),
      optStart: true,
      outID: Message('item_id'),
      outData: Message('application'),
    })

    // Every field ID from the form, with what the applicant typed beside it. `resume` is
    // a link: the upload went to storage on its own and the submission carries the address.
    .then('d10003', 'Core.Programming.Debug', 'Show The Application', {
      optActive: true,
      optDebugData: Message('application'),
    });
}).start();
