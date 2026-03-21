# Calorie Coach Agent

Calorie Coach Agent is a personal nutrition tracking assistant powered by Robomotion's Chat Assistant and LLM Agent nodes. It uses a SQLite database to log meals, manage user profiles, and track daily calorie and macro goals, all through a natural conversational interface.

Whether you want to track your daily food intake, monitor your macros, or get quick meal summaries, this template gives you a fully functional calorie coaching chatbot that learns your profile and keeps a running food diary.

## What Calorie Coach Agent can do

- Track meals via text descriptions or photo analysis
- Store user profiles with personalized calorie and macro goals
- Log food entries with calories, protein, carbs, fat, and portion sizes
- Provide daily and weekly intake summaries against your goals
- Guide new users through an onboarding flow to set up their profile
- Correct or delete previously logged food entries
- Suggest remaining calorie budgets and meal options

## Behind the scenes

The flow listens for incoming messages through the Chat In node. Each message, along with any attached food photos, is forwarded to the LLM Agent node named Milo, which acts as a friendly calorie coach. Milo uses the SQLite skill to maintain a local database at `~/Documents/calories.db` with tables for user profiles and food logs. On first interaction, Milo walks the user through an onboarding conversation to collect their name, age, weight, height, activity level, and calorie goal. Once the profile is set up, users can log meals by describing them in text or sending photos, and Milo estimates the nutritional values and stores them. If an error occurs at any point, a Catch node intercepts it and returns a friendly error message instead of failing silently.

## Setup Guide

1. **Configure Credentials:** Use **Robomotion AI Credits** (default) or set up your own API keys in the **Vault** for a **Bring Your Own Key (BYOK)** configuration.
2. **Version & Publish:** Create a new version of this flow and **Publish** it to make it available for deployment.
3. **Create Agent:** Navigate to the **Admin Console > Agents** screen, create a new agent, and select this flow and its published version.
4. **Install Desktop App:** Download and install the **Robomotion Desktop App** from [robomotion.io/downloads](https://robomotion.io/downloads) and log in to your workspace.
5. **Locate Agent:** Refresh your robot list in the Desktop App to find the newly created agent for this flow.
6. **Connect & Start:** Connect the robot and press the **Play** button to start the agent.
7. **Launch Chat:** Return to the **Agents** screen in the Admin Console, find your agent, and click the **Open** button to start chatting.

## Customization

Double-click the **LLM Agent** node to update the **System Prompt**, adjust the coaching personality, modify the database schema, or change the default calorie and macro goals. You can also add additional skills beyond SQLite to extend the agent's capabilities.
