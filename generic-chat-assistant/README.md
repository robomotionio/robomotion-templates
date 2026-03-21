# Generic Chat Assistant

Generic Chat Assistant is a ready-to-use conversational AI template powered by Robomotion's Chat Assistant and LLM Agent nodes. It provides a simple chat interface where users can ask questions and receive answers from a large language model, with no additional configuration required out of the box.

Whether you need a quick internal help desk bot, a knowledge assistant, or a starting point for a more advanced conversational agent, this template gives you a working chat flow in minutes.

## What Generic Chat Assistant can do

- Accept user messages through the built-in Chat Assistant UI
- Route questions to an LLM Agent for intelligent responses
- Support file attachments alongside text messages
- Handle unexpected errors gracefully with user-friendly error messages
- Work immediately with Robomotion AI Credits or your own API keys (BYOK)

## Behind the scenes

The flow listens for incoming messages through the Chat In node. Each message, along with any attached files, is forwarded to the LLM Agent node, which processes the query and generates a response. The response is then sent back to the user through the Chat Out node. If an error occurs at any point, a Catch node intercepts it and returns a friendly error message instead of failing silently.

## Setup Guide

1. **Configure Credentials:** Use **Robomotion AI Credits** (default) or set up your own API keys in the **Vault** for a **Bring Your Own Key (BYOK)** configuration.
2. **Version & Publish:** Create a new version of this flow and **Publish** it to make it available for deployment.
3. **Create Agent:** Navigate to the **Admin Console > Agents** screen, create a new agent, and select this flow and its published version.
4. **Install Desktop App:** Download and install the **Robomotion Desktop App** from [robomotion.io/downloads](https://robomotion.io/downloads) and log in to your workspace.
5. **Locate Agent:** Refresh your robot list in the Desktop App to find the newly created agent for this flow.
6. **Connect & Start:** Connect the robot and press the **Play** button to start the agent.
7. **Launch Chat:** Return to the **Agents** screen in the Admin Console, find your agent, and click the **Open** button to start chatting.

## Customization

Double-click the **LLM Agent** node to update the **System Prompt** or select skills for your agent. This lets you tailor the assistant's personality, domain knowledge, and capabilities to your specific use case.
