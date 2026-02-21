import { flow, AI, Credential, Custom, Message } from '@robomotion/sdk';

flow.create('cacf4dbd-9b62-4e1d-824a-1c70eb16ccfb', 'Imported Domain Inspector', (f) => {
  f.addDependency('Robomotion.ChatAssistant', '1.5.0');
  f.addDependency('Robomotion.Agents', '0.11.2');
  f.addDependency('Robomotion.Monitoring', '0.4.1');

  f.node('e7a89a', 'Core.Flow.Comment', 'Comment', { optText: '### Domain Inspector\nan AI Agent that can query live DNS and SSL information using our Monitoring package nodes as a tools.\n\nYoutube Video:\nhttps://www.youtube.com/watch?v=8kLEIm78rII' });
  f.node('1bdd59', 'Robomotion.ChatAssistant.ChatIn', 'Chat In', {})
    .then('dfab1c', 'Robomotion.Agents.Agent.LLMAgent', 'LLM Agent', {
    inName: Custom('domain_inspector'),
    inDescription: Custom('Checks SSL status and DNS configuration of domains.'),
    func: 'You are a domain inspector assistant. Your job is to check and report on:\n\n- SSL/TLS certificate information (expiration, issuer, validity, etc.)\n- DNS records (A, AAAA, MX, TXT, CNAME, NS, etc.)\n\nWhen given a domain, provide the relevant SSL and/or DNS details clearly and concisely.\n\nIf a user asks about something unrelated to domain inspection, politely decline and explain that you only handle SSL and DNS lookups.\n\nYou MUST use the agent tools to answer these questions.\n',
    inQuery: Message('payload.text'),
    inFiles: Message('payload.files'),
    optApiKey: Credential({ vaultId: '0776fea4-24b5-45d8-9524-73022f195167', itemId: '7796a517-0bf0-41b4-b935-aa31ef6063e5' })
  });
  f.node('ecf3af', 'Core.Trigger.Catch', 'Catch', { optNodes: { type: 'catch', ids: ['dfab1c', '64834d', 'e3100b', '09b01e'], all: false } })
    .then('f280e2', 'Core.Programming.Function', 'Set Error', { func: 'msg.text = `⚠️ The inspection couldn’t be completed due to an internal system error. Feel free to retry by refreshing the page.`;\nreturn msg;' });
  f.node('e3100b', 'Robomotion.Monitoring.SSL', 'SSL', { inURL: AI('url') });
  f.node('09b01e', 'Robomotion.Monitoring.DNS', 'DNS', { inDomain: AI('domain'), optRecordType: 'ALL' });
  f.node('64834d', 'Robomotion.ChatAssistant.Text', 'Text', { inText: Message('text') })
    .then('9b627f', 'Robomotion.ChatAssistant.ChatOut', 'Chat Out', {});

  f.edge('dfab1c', 3, '64834d', 0);
  f.edge('dfab1c', 1, 'e3100b', 0);
  f.edge('dfab1c', 1, '09b01e', 0);
  f.edge('f280e2', 0, '64834d', 0);
}).start();