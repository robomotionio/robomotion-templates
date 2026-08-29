import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', "Conversational Order Assistant", (f) => {
  f.addDependency('Robomotion.ChatAssistant', '1.8.6');
  f.addDependency('Robomotion.ADK', '0.22.2');

  f.node('b2d001', 'Core.Flow.Comment', 'Comment', { optText: '#### Conversational Order Assistant\n\nA conversational chat assistant hands the conversation to an LLM Agent. Nobody draws the questions: the instructions say what to collect, and the model asks for whatever is missing, in whatever order the customer brings it.\n\nAn LLM Agent has three outputs before its ordinary one: sub-agents, tools and callbacks. Anything wired to the tools port becomes something the model can decide to call, so the Tool In branch below is an ordinary automation the model can reach for mid sentence. Replace Find The Order with a portal login, a database query, or whatever your lookup really is.\n\nButtons and tick boxes are refused in this mode by the nodes themselves. In a conversation, the asking is the model\'s job.' });

  f.node('b2d002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n1. Configure Credentials: Use Robomotion AI Credits (already on in this template) or point the LLM Agent at your own API key in the Vault.\n2. Version & Publish: Create a new version of this flow and Publish it, because an agent can only point at a published version.\n3. Create Agent: Admin Console > Agents > Create Agent. Pick this flow and its version, choose Conversational mode, and add a few sample questions.\n4. Install Desktop App: Download the Robomotion Desktop App from robomotion.io/downloads and log in to your workspace.\n5. Connect: Refresh the robot list, find the Application Robot the agent created, and connect it.\n6. Run: Press Play here in the Designer so you can watch the nodes light up, or start it from the agent card.\n7. Launch Chat: Open the Agents screen, find your agent, and press Open.\n8. Try it: Say something like "the boots I ordered turned up with a broken zip". The order numbers this template knows are 48120677 and 48120691.', comment: '### 🚀 Setup Guide\n\n1. **Configure Credentials:** Use **Robomotion AI Credits** (already on in this template) or point the LLM Agent at your own API key in the **Vault**.\n2. **Version & Publish:** Create a new version of this flow and **Publish** it, because an agent can only point at a published version.\n3. **Create Agent:** **Admin Console > Agents > Create Agent**. Pick this flow and its version, choose **Conversational** mode, and add a few sample questions.\n4. **Install Desktop App:** Download the **Robomotion Desktop App** from [robomotion.io/downloads](https://robomotion.io/downloads) and log in to your workspace.\n5. **Connect:** Refresh the robot list, find the **Application Robot** the agent created, and connect it.\n6. **Run:** Press **Play** here in the Designer so you can watch the nodes light up, or start it from the agent card.\n7. **Launch Chat:** Open the **Agents** screen, find your agent, and press **Open**.\n8. **Try it:** Say something like *"the boots I ordered turned up with a broken zip"*. The order numbers this template knows are `48120677` and `48120691`.' });

  f.node('b2d101', 'Robomotion.ChatAssistant.ChatIn', 'Chat In', {})
    .then('b2d102', 'Robomotion.ADK.Agent.LLMAgent', 'Order Assistant', {
      inSessionId: Message('session_id'),
      inName: Custom('order_assistant'),
      inDescription: Custom('Takes returns for orders'),
      func: 'You are the returns desk. A customer will tell you what is wrong with something they ordered.\n\nCollect three things before you finish: the order number, what went wrong, and what they would like you to do about it. Ask for whatever is missing, one question at a time, in plain language.\n\nAlways check an order number with the look_up_order tool before you accept it. When the lookup succeeds, name the item it returned in your very next reply, so the customer can see you found the right order. If the tool says the order was not found, say so and ask them to check the digits.\n\nWhen you have all three, confirm the return in two short sentences and stop.\n\nKeep every reply under forty words. Never invent a delivery time, a refund amount or a reference number: say only what the tools told you.',
      inUserPrompt: Message('payload.text'),
      inFiles: Message('payload.files'),
      inOutputKey: Custom(''),
      outText: Message('text'),
      outImages: Message('images'),
      outFileUris: Message('file_uris'),
      outCodeOutputs: Message('code_outputs'),
      outRawResponse: Message('raw_response'),
      optModelName: 'gemini-3.1-flash',
      optCustomModelString: Custom(''),
      optApiBaseUrl: Custom(''),
      optOutputSchema: Custom(''),
      optTimeout: Custom('300'),
      optSessionService: 'robomotion',
      optArtifactService: 'robomotion',
      optIncludeRawResponse: false,
      optUseRobomotionCredits: true,
    })
    ;

  f.node('b2d103', 'Robomotion.ChatAssistant.Text', 'Say It Back', { inText: Message('text') })
    .then('b2d104', 'Robomotion.ChatAssistant.ChatOut', 'Chat Out', {})
    ;

  f.node('b2d105', 'Robomotion.ADK.Tool.ToolIn', 'Look Up An Order', {
    inCallerId: Message('caller_id'),
    inToolName: Custom('look_up_order'),
    inToolDescription: Custom('Look up an order by its eight digit order number. Returns the item and the date it was placed, or found: false when there is no such order.'),
    func: '{\n  "type": "object",\n  "properties": {\n    "order_number": {\n      "type": "string",\n      "description": "The eight digit order number, for example 48120677"\n    }\n  },\n  "required": ["order_number"]\n}',
    outToolName: Message('tool'),
    outParameters: Message('parameters'),
    optTimeout: Custom('300'),
  })
    .then('b2d106', 'Core.Programming.Function', 'Find The Order', {
      func: 'var orders = {\n  "48120677": { item: "Trail Runner GTX, size 42", placed: "12 August" },\n  "48120691": { item: "Rain Shell, medium", placed: "14 August" }\n};\nvar no = String((msg.parameters && msg.parameters.order_number) || "").trim();\nvar hit = orders[no];\nmsg.result = hit ? { found: true, order: no, item: hit.item, placed: hit.placed }\n                 : { found: false, order: no };\nreturn msg;',
    })
    .then('b2d107', 'Robomotion.ADK.Tool.ToolOut', 'Hand It Back', {
      inCallerId: Message('caller_id'),
      inResult: Message('result'),
    })
    ;

  f.edge('b2d102', 3, 'b2d103', 0);
  f.edge('b2d102', 1, 'b2d105', 0);
}).start();
