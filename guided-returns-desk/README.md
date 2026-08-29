# Guided Returns Desk

Guided Returns Desk is a chat assistant that opens a product return by asking for exactly what it needs, one question at a time. Every question is a node you can see on the canvas: a Textbox for the order number, a ButtonGroup for what went wrong, and a Checkbox group for what to do about it.

It is a good starting point for any intake where the process is fixed and you need the answers to be exact: a returns desk, a support request, a booking, an onboarding form that has to be filled in properly the first time.

## What Guided Returns Desk can do

- Ask a fixed sequence of questions through the Chat Assistant UI, in the order you drew them
- Constrain the answers at the widget: a maximum length on the order number, three buttons for the reason, tick boxes where more than one answer is allowed
- Check an answer against your own data while the customer is still in the conversation
- Say what is wrong in plain language and ask again, instead of failing into a log
- Read the whole return back with a reference, and close the session

## Behind the scenes

Chat In is the trigger, because the person opening the chat is the input. A Text node says the first line, and a Textbox node draws an input and stops the flow until it is answered. Look The Order Up checks the answer against a small table, and Do We Have It splits on the result: an order we recognise goes on to the buttons and the tick boxes, and one we do not goes to Say We Cannot Find It, whose wire runs back to the question so the customer gets another go.

With three answers collected, Open The Return builds a reference and a summary, a Text node reads it back, and Chat Out ends the session and releases the robot for the next person.

A widget hands its answer back as an object, not a string, which is the thing people get wrong most often. The flow reads `msg.order.value`, never `msg.order`. Checkbox groups and multi-select button groups give an array.

## Setup Guide

1. **Version & Publish:** Create a new version of this flow and **Publish** it, because an agent can only point at a published version.
2. **Create Agent:** Go to **Admin Console > Agents > Create Agent**. Pick this flow and its version, choose **Guided** mode, and leave "Also create an instance" ticked. That mints an Application Robot with the agent's name.
3. **Install Desktop App:** Download the **Robomotion Desktop App** from [robomotion.io/downloads](https://robomotion.io/downloads) and log in to your workspace.
4. **Connect:** Refresh the robot list, find the new Application Robot, and connect it. An Application Robot runs one flow and nothing else.
5. **Run:** Press **Play** here in the Designer so you can watch the nodes light up, or start it from the agent card.
6. **Launch Chat:** Open the **Agents** screen, find your agent, and press **Open**. Anyone you send that link to can answer, with no account of their own.

## Try it

The order numbers this template knows are `48120677` and `48120691`. Type anything else and the flow takes the other branch, tells you it cannot find that order, and asks again.

## Customization

**Look The Order Up** is the node to replace first. It holds two orders in a literal so the template runs with no setup; in a real desk this is a database query, an API call, or a browser automation against your order system. Everything downstream only needs it to set `msg.match` and `msg.known`.

The questions themselves are properties. Open **Ask What Went Wrong** or **Ask What To Do** and edit **Custom Labels** to change the options, or drag in a Dropdown, a Datepicker or an Upload File node from the Chat Assistant library to ask for something else.

Note that ButtonGroup and Checkbox are **guided mode only** — the nodes refuse to run in a conversational agent, where the asking is the model's job.
