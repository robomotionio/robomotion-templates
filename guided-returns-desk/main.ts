import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Guided Returns Desk", (f) => {
  f.addDependency('Robomotion.ChatAssistant', '1.8.6');

  f.node('a1c001', 'Core.Flow.Comment', 'Comment', { optText: '#### Guided Returns Desk\n\nA guided chat assistant asks the questions you drew, in the order you drew them. Every question here is a node: a Textbox for the order number, a ButtonGroup for what went wrong, and a Checkbox group for what to do about it.\n\nThe interesting part is in the middle. Look The Order Up and Do We Have It check the answer while the customer is still in the conversation, and the wire from Say We Cannot Find It goes back to the question, so a wrong order number gets another go instead of an exception in a log nobody reads.' });

  f.node('a1c002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n1. Version & Publish: Create a new version of this flow and Publish it, because an agent can only point at a published version.\n2. Create Agent: Admin Console > Agents > Create Agent. Pick this flow and its version, choose Guided mode, and leave "Also create an instance" ticked.\n3. Install Desktop App: Download the Robomotion Desktop App from robomotion.io/downloads and log in to your workspace.\n4. Connect: Refresh the robot list, find the Application Robot the agent created, and connect it.\n5. Run: Press Play here in the Designer so you can watch the nodes light up, or start it from the agent card.\n6. Launch Chat: Open the Agents screen, find your agent, and press Open.\n7. Try it: The order numbers this template knows are 48120677 and 48120691. Anything else takes the other branch.', comment: '### 🚀 Setup Guide\n\n1. **Version & Publish:** Create a new version of this flow and **Publish** it, because an agent can only point at a published version.\n2. **Create Agent:** **Admin Console > Agents > Create Agent**. Pick this flow and its version, choose **Guided** mode, and leave "Also create an instance" ticked.\n3. **Install Desktop App:** Download the **Robomotion Desktop App** from [robomotion.io/downloads](https://robomotion.io/downloads) and log in to your workspace.\n4. **Connect:** Refresh the robot list, find the **Application Robot** the agent created, and connect it.\n5. **Run:** Press **Play** here in the Designer so you can watch the nodes light up, or start it from the agent card.\n6. **Launch Chat:** Open the **Agents** screen, find your agent, and press **Open**.\n7. **Try it:** The order numbers this template knows are `48120677` and `48120691`. Anything else takes the other branch.' });

  f.node('a1c101', 'Robomotion.ChatAssistant.ChatIn', 'Chat In', {})
    .then('a1c102', 'Robomotion.ChatAssistant.Text', 'Say Hello', {
      inText: Custom('Returns desk. I can open a return for an order you have with us.'),
    })
    .then('a1c103', 'Robomotion.ChatAssistant.Textbox', 'Ask For The Order Number', {
      inLabel: Custom('Order number'),
      inPlaceholder: Custom('The eight digits on your confirmation email'),
      optInputType: 'text',
      optMaxLength: Custom('8'),
      outResult: Message('order'),
    })
    .then('a1c104', 'Core.Programming.Function', 'Look The Order Up', {
      func: 'var orders = {\n  "48120677": { item: "Trail Runner GTX, size 42", placed: "12 August" },\n  "48120691": { item: "Rain Shell, medium", placed: "14 August" }\n};\nmsg.order_no = String(msg.order.value || "").trim();\nmsg.match = orders[msg.order_no] || null;\nmsg.known = msg.match !== null;\nreturn msg;',
    })
    .then('a1c105', 'Core.Programming.Switch', 'Do We Have It', {
      optConditions: [Custom('msg.known === true'), Custom('true')],
      optUseBreak: true,
    })
    ;

  f.node('a1c106', 'Robomotion.ChatAssistant.Text', 'Say We Cannot Find It', {
    inText: Custom('I cannot find an order with that number. Check the digits on your confirmation email and try again.'),
  });

  f.node('a1c107', 'Robomotion.ChatAssistant.ButtonGroup', 'Ask What Went Wrong', {
    inLabel: JS('`What went wrong with the ${msg.match.item}?`'),
    optCustomLabels: [
      { scope: 'Custom', name: { label: 'Damaged' } },
      { scope: 'Custom', name: { label: 'Wrong item' } },
      { scope: 'Custom', name: { label: 'Never arrived' } },
    ],
    outResult: Message('reason'),
  })
    .then('a1c108', 'Robomotion.ChatAssistant.Checkbox', 'Ask What To Do', {
      inLabel: Custom('What would you like us to do?'),
      optCustomOptions: [
        { scope: 'Custom', name: { label: 'Item refund' } },
        { scope: 'Custom', name: { label: 'Postage refund' } },
        { scope: 'Custom', name: { label: 'Replacement' } },
      ],
      outResult: Message('actions'),
    })
    .then('a1c109', 'Core.Programming.Function', 'Open The Return', {
      func: 'var actions = (msg.actions && msg.actions.value) || [];\nmsg.ref = "RMA-" + msg.order_no.slice(-4);\nmsg.summary = "Return " + msg.ref + " is open for order " + msg.order_no + ".\\n\\n"\n  + "- Item: " + msg.match.item + "\\n"\n  + "- Reason: " + msg.reason.value + "\\n"\n  + "- You asked us to: " + actions.join(", ") + "\\n\\n"\n  + "A prepaid label is on its way to your email.";\nreturn msg;',
    })
    .then('a1c10a', 'Robomotion.ChatAssistant.Text', 'Confirm It', { inText: Message('summary') })
    .then('a1c10b', 'Robomotion.ChatAssistant.ChatOut', 'Chat Out', {})
    ;

  f.edge('a1c105', 0, 'a1c107', 0);
  f.edge('a1c105', 1, 'a1c106', 0);
  f.edge('a1c106', 0, 'a1c103', 0);
}).start();
