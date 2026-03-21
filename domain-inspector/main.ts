import { flow, AI, Custom, Message } from '@robomotion/sdk';

flow.create('9d663a2a-265f-44bc-a0b6-d2b7dbb8ad91', 'Domain Inspector', (f) => {
  f.addDependency('Robomotion.ChatAssistant', '1.7.3');
  f.addDependency('Robomotion.Agents', '0.14.1');
  f.addDependency('Robomotion.Monitoring', '0.5.5');

  f.node('e7a89a', 'Core.Flow.Comment', 'Comment', { optText: '### Domain Inspector\nAn AI Agent that can query live DNS and SSL information using the Monitoring package nodes as tools.\n\nhttps://www.youtube.com/watch?v=8kLEIm78rII' });
  f.node('ecf3af', 'Core.Trigger.Catch', 'Catch', { optNodes: { type: 'catch', ids: ['dfab1c', '64834d', 'e3100b', '09b01e'], all: false } })
    .then('f280e2', 'Core.Programming.Function', 'Set Error', { func: 'msg.text = `⚠️ The inspection couldn’t be completed due to an internal system error. Feel free to retry by refreshing the page.`;\nreturn msg;' });
  f.node('c82e42', 'Robomotion.ChatAssistant.ChatIn', 'Chat In', {})
    .then('43c566', 'Robomotion.Agents.Agent.LLMAgent', 'LLM Agent', {
    inName: Custom('domain_inspector'),
    inDescription: Custom('Checks SSL status and DNS configuration of domains.'),
    func: 'You are a domain inspector assistant. Your job is to check and report on:\n\n- SSL/TLS certificate information (expiration, issuer, validity, etc.)\n- DNS records (A, AAAA, MX, TXT, CNAME, NS, etc.)\n\nWhen given a domain, provide the relevant SSL and/or DNS details clearly and concisely.\n\nIf a user asks about something unrelated to domain inspection, politely decline and explain that you only handle SSL and DNS lookups.\n\nYou MUST use the agent tools to answer these questions.\n',
    inUserPrompt: Message('payload.text'),
    inFiles: Message('payload.files'),
    optSkills: '[]',
    optActiveSkills: '[]',
    optUseRobomotionCredits: true
  });
  f.node('c290ec', 'Robomotion.ChatAssistant.Text', 'Text', { inText: Message('text') })
    .then('fba94e', 'Robomotion.ChatAssistant.ChatOut', 'Chat Out', {});
  f.node('1cbc07', 'Robomotion.Monitoring.SSL', 'SSL', { inURL: AI('domain') });
  f.node('a634a3', 'Robomotion.Monitoring.DNS', 'DNS', { inDomain: AI('domain'), optRecordType: 'ALL' });

  f.edge('f280e2', 0, 'c290ec', 0);
  f.edge('43c566', 3, 'c290ec', 0);
  f.edge('43c566', 1, '1cbc07', 0);
  f.edge('43c566', 1, 'a634a3', 0);
}).start();