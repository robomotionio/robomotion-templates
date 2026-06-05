import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('3fb6feaf-6f5a-4b32-a100-8f31ced922da', 'Generic Chat Assistant', (f) => {
  f.addDependency('Robomotion.ChatAssistant', '1.8.3');
  f.addDependency('Robomotion.ADK', '0.22.2');

  f.node('c04699', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide \n\n1. Configure LLM Agent node credentials: Use Robomotion AI Credits (default) or set up your own API Keys in the Vault for a Bring Your Own Key (BYOK) configuration.\n2. Version & Publish: Create a new version of this flow and Publish it to make it available for deployment.\n3. Create Agent: Navigate to the Admin Console > Agents screen, create a new agent, and select this flow and its published version.\n4. Install Desktop App: Download and install the Robomotion Desktop App from robomotion.io/downloads and log in to your workspace.\n5. Locate Agent: Refresh your robot list in the Desktop App to find the newly created agent for this flow.\n6. Connect & Start: Connect the robot and press the Play button to start the agent.\n7. Launch Chat: Return to the Agents screen in the Admin Console, find your agent, and click the Open button to start chatting!', comment: Custom('### 🚀 Setup Guide\n\n1. **Configure Credentials:** Use **Robomotion AI Credits** (default) or set up your own API Keys in the **Vault** for a **Bring Your Own Key (BYOK)** configuration.\n2. **Version & Publish:** Create a new version of this flow and **Publish** it to make it available for deployment.\n3. **Create Agent:** Navigate to the **Admin Console > Agents** screen, create a new agent, and select this flow and its published version.\n4. **Install Desktop App:** Download and install the **Robomotion Desktop App** from [robomotion.io/downloads](https://robomotion.io/downloads) and log in to your workspace.\n5. **Locate Agent:** Refresh your robot list in the Desktop App to find the newly created agent for this flow.\n6. **Connect & Start:** Connect the robot and press the **Play** button to start the agent.\n7. **Launch Chat:** Return to the **Agents** screen in the Admin Console, find your agent, and click the **Open** button to start chatting!') });
  f.node('4e9867', 'Core.Flow.Comment', 'Comment', { optText: '#### Generic Chat Assistant\n\nThe default LLM Agent flow is designed to answer user questions in a straightforward manner. You can double-click the LLM Agent node to update System Prompt or select skills for your Agent. To open the Chat Assistant UI, follow the setup guide.' });
  f.node('ecf3af', 'Core.Trigger.Catch', 'Catch', { optNodes: { type: 'catch', ids: [], all: true } })
    .then('f280e2', 'Core.Programming.Function', 'Set Error', { func: 'msg.text = "⚠️ I apologize, but I encountered an unexpected error while processing your request. Please try again in a moment.";\nreturn msg;' });
  f.node('c223fe', 'Robomotion.ChatAssistant.ChatIn', 'Chat In', {})
    .then('3d3702', 'Robomotion.ADK.Agent.LLMAgent', 'LLM Agent', {
    inName: Custom('generic_agent'),
    inDescription: Custom('Generic chat assistant agent'),
    inUserPrompt: Message('payload.text'),
    inFiles: Message('payload.files'),
    optProvider: 'gemini',
    optModelName: 'gemini-3.1-flash-lite',
    optUseRobomotionCredits: true
  });
  f.node('9aa22e', 'Robomotion.ChatAssistant.Text', 'Text', { inText: Message('text') })
    .then('274314', 'Robomotion.ChatAssistant.ChatOut', 'Chat Out', {});

  f.edge('f280e2', 0, '9aa22e', 0);
  f.edge('3d3702', 3, '9aa22e', 0);
}).start();
