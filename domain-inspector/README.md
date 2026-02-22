# Domain Inspector

An AI chat agent that checks SSL certificates and DNS records for any domain. Ask it a question like "Check robomotion.io" and it returns live results.

## How It Works

Users interact through the Chat Assistant interface. The LLM Agent receives the question and uses tool-calling to invoke two Monitoring nodes — one for SSL (expiration, issuer, validity) and one for DNS (A, AAAA, MX, TXT, CNAME, NS records). The agent summarizes the results in a conversational reply. If anything fails, a Catch node returns a friendly error message instead of crashing.

## Prerequisites

- Install **Robomotion.ChatAssistant**, **Robomotion.Agents**, and **Robomotion.Monitoring** packages
- Configure an LLM API key credential (OpenAI, Google Gemini, etc.) in the **LLM Agent** node

## Video Tutorial

[Watch on YouTube](https://www.youtube.com/watch?v=8kLEIm78rII)
