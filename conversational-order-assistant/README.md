# Conversational Order Assistant

Conversational Order Assistant takes a product return the way a person would explain it: in whatever order it comes out. Nobody draws the questions. An LLM Agent is told what to collect, and it asks for whatever is missing.

The part worth copying is the branch on the agent's **tools** port. A Tool In node declares a tool with a name, a description and a JSON schema; behind it sits an ordinary automation; a Tool Out node hands the result back. The model can call it mid sentence, which is how an assistant looks something up in your systems while it is still talking to the customer.

## What Conversational Order Assistant can do

- Hold a free-form conversation through the Chat Assistant UI, with no fixed question order
- Work out what is still missing and ask for it, in plain language
- Call your automation as a tool, and use what comes back in its next reply
- Run on Robomotion AI Credits out of the box, or on your own API key from the Vault
- Keep every turn in one conversation through the session id

## Behind the scenes

Chat In hands the message to the LLM Agent, which gets the text as its user prompt and the session id so the turns are one conversation. Its instructions say what to collect and how to behave, and nothing else in the flow decides the order of the questions.

An LLM Agent has three outputs before its ordinary one: **sub-agents**, **tools** and **callbacks**. Anything wired to tools becomes something the model can decide to call. Here that is Look Up An Order, whose JSON schema tells the model it takes an eight digit order number, followed by Find The Order and Hand It Back.

The ordinary output goes to a Text node that says the reply, and Chat Out ends the session.

## Setup Guide

1. **Configure Credentials:** This template has **Use Robomotion AI Credits** switched on, so it runs with no key. To bring your own, turn that off and point the LLM Agent's **API Key** at a Vault item.
2. **Version & Publish:** Create a new version of this flow and **Publish** it, because an agent can only point at a published version.
3. **Create Agent:** Go to **Admin Console > Agents > Create Agent**. Pick this flow and its version, choose **Conversational** mode, and add a few sample questions — they become the opening prompts on the chat page.
4. **Install Desktop App:** Download the **Robomotion Desktop App** from [robomotion.io/downloads](https://robomotion.io/downloads) and log in to your workspace.
5. **Connect:** Refresh the robot list, find the Application Robot the agent created, and connect it.
6. **Run:** Press **Play** here in the Designer so you can watch the nodes light up, or start it from the agent card.
7. **Launch Chat:** Open the **Agents** screen, find your agent, and press **Open**.

## Try it

Say something like *"the boots I ordered turned up with a broken zip"* and let it ask you for the rest. The order numbers this template knows are `48120677` and `48120691`.

## Customization

**Find The Order** is the node to replace first. It holds two orders in a literal so the template runs with no setup; swap it for a portal login, a database query or an API call and change nothing else, as long as it still sets `msg.result`.

To give the model more to work with, add another **Tool In → your automation → Tool Out** branch off the same tools port. Each Tool In needs its own name, description and JSON schema — that description is the only thing the model reads when it decides whether to call it, so it is worth writing carefully.

Double-click the **Order Assistant** node to edit its instructions, or change **Model Name** to any of the curated models.
