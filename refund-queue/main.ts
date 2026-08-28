import { flow, Message, Custom, JS, Credential } from '@robomotion/sdk';

// Refund Queue — one work list, any number of robots.
//
// A queue is the work list that sits between the flow that *finds* work and the flow
// that *does* it. This template is both halves, in one file, joined by a single wire:
// the intake walks a list of refund requests and puts each one on the queue, and when
// it runs out the same run drops into the worker loop and drains what it just filled.
//
// The two halves are independent on purpose. Cut the wire from For Each's done port
// and you have an intake you can schedule and a worker you can run on ten robots at
// once — no robot is ever handed an item another robot already took, because Get Next
// Item marks it In Progress as it hands it over.
//
// Items are encrypted with an AES key from your vault before they leave the robot, so
// the Admin Console can show you what happened to every item and never what it said.
// The same key must be selected on Add Item and on Get Next Item.
flow.create('a0fc670c-f6ea-489c-aff0-e4b1e1436ae8', 'Refund Queue', (f) => {

  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: '#### Refund Queue\nOne work list, any number of robots. The **intake** puts three refund requests on a queue called `Refunds`; the **worker** takes them off one at a time, decides each one, and writes back what happened.\n\nItems are encrypted with an AES key from your vault before they leave the robot, so the Admin Console records the fate of every item and can never read one.\n\nCut the wire from *For Each Request* (done port) to *Go To Next Item* and the two halves become two flows: schedule the intake, run the worker on as many robots as you like.' });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n**1.** Admin Console > Queues > **Create Queue**, name it `Refunds`.\n\n**2.** Admin Console > Vaults > **New Vault**, name it `Queue Keys`. Add an item of type **AES Key** called `Refunds Key` and let it generate the key.\n\n**3.** Admin Console > Robots > your robot > **Vaults**, and give it access to `Queue Keys`. A robot can only decrypt items with a key it has been granted.\n\n**4.** Open *Put It On The Queue* and *Take The Next Item* and select that vault item in the **AES Key** property. Both nodes need the same key.\n\n**5.** Run the flow. Three items appear in the New column, then drain: two Successful, one Failed.\n\n**6.** Watch it in Admin Console > Queues > Refunds. Reset by deleting the queue, not its items: an ID Key is never released.' });

  // ---- intake: fill the queue ------------------------------------------------
  f.node('a10001', 'Core.Trigger.Inject', 'Start', {})
    .then('a10002', 'Core.Programming.Function', 'List Refund Requests', {
      func:
        "msg.requests = [\n" +
        "  { ticket: 'RF-2041', customer: 'Northwind Traders', order: 'SO-8801', amount: 120 },\n" +
        "  { ticket: 'RF-2042', customer: 'Contoso Ltd', order: 'SO-8814', amount: 240 },\n" +
        "  { ticket: 'RF-2043', customer: 'Fabrikam Inc', order: '', amount: 90 }\n" +
        "];\n" +
        "return msg;",
    });

  f.node('a10003', 'Core.Flow.Label', 'Next Request', {})
    .then('a10004', 'Core.Programming.ForEach', 'For Each Request', {
      optInput: Message('requests'),
      optOutput: Message('request'),
    });

  // Add Item takes one object, not an array, which is why the intake is a loop.
  // optIDKey names the field that makes an item unique: queue the same ticket twice
  // and the second one is refused.
  f.node('a10005', 'Core.Queue.Add', 'Put It On The Queue', {
    inData: Message('request'),
    optQueueName: Custom('Refunds'),
    optAESKey: Credential({ vaultId: '_', itemId: '_' }),
    optIDKey: Custom('ticket'),
    optPriority: 2,
    optMaxTry: 3,
  });

  f.node('a10006', 'Core.Flow.GoTo', 'Go To Next Request', {
    optNodes: { ids: ['a10003'], type: 'goto', all: false },
  });

  // ---- worker: drain the queue -----------------------------------------------
  f.node('a10008', 'Core.Flow.Label', 'Next Item', {})
    .then('a10009', 'Core.Queue.Get', 'Take The Next Item', {
      optQueueName: Custom('Refunds'),
      optAESKey: Credential({ vaultId: '_', itemId: '_' }),
      optStart: true,
      outID: Message('item_id'),
      outData: Message('item'),
    })
    .then('a1000a', 'Core.Programming.Switch', 'Did We Get One', {
      optConditions: [Custom('msg.item_id != null'), Custom('msg.item_id == null')],
      optUseBreak: true,
    });

  f.node('a1000b', 'Core.Flow.Stop', 'Queue Is Empty', {});

  f.node('a1000c', 'Core.Programming.Function', 'Check The Refund', {
    func:
      "msg.ok = msg.item.order.length > 0;\n" +
      "msg.note = msg.ok\n" +
      "  ? 'Refunded ' + msg.item.amount + ' on order ' + msg.item.order\n" +
      "  : 'No order number on this request';\n" +
      "return msg;",
  })
    .then('a1000d', 'Core.Programming.Switch', 'Can We Refund It', {
      optConditions: [Custom('msg.ok'), Custom('!msg.ok')],
      optUseBreak: true,
    });

  // Every item must be told what happened to it. A failed item keeps its remaining
  // attempts, so it can be put back by hand or picked up by a later run.
  f.node('a1000e', 'Core.Queue.Update', 'Mark It Successful', {
    inItemID: Message('item_id'),
    inStatus: 'successful',
    inProgress: Message('note'),
  });

  f.node('a1000f', 'Core.Queue.Update', 'Mark It Failed', {
    inItemID: Message('item_id'),
    inStatus: 'failed',
    inProgress: Message('note'),
  });

  f.node('a10010', 'Core.Flow.GoTo', 'Go To Next Item', {
    optNodes: { ids: ['a10008'], type: 'goto', all: false },
  });

  // The one wire that makes two halves one flow: when the intake runs out of
  // requests, For Each leaves by its done port and the worker loop starts.
  f.node('a10011', 'Core.Flow.GoTo', 'Start Working The Queue', {
    optNodes: { ids: ['a10008'], type: 'goto', all: false },
  });

  f.edge('a10002', 0, 'a10006', 0);
  f.edge('a10004', 0, 'a10005', 0);
  f.edge('a10005', 0, 'a10006', 0);
  f.edge('a10004', 1, 'a10011', 0);
  f.edge('a1000a', 0, 'a1000c', 0);
  f.edge('a1000a', 1, 'a1000b', 0);
  f.edge('a1000d', 0, 'a1000e', 0);
  f.edge('a1000d', 1, 'a1000f', 0);
  f.edge('a1000e', 0, 'a10010', 0);
  f.edge('a1000f', 0, 'a10010', 0);
}).start();
