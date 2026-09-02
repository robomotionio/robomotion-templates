import { flow, Message } from '@robomotion/sdk';

flow.create('e25280b2-f023-42b3-b962-d982b7eec07e', 'Website Pitch Builder', (f) => {
  f.addDependency('Robomotion.DeepSeekAgent', '0.7.5');

  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: '#### Website Pitch Builder\nSearch Google Maps for a trade, keep only the shops that have no website of their own and enough reviews to prove they have customers, and build the best one a page it can actually be pitched with.\n\n*Find The Lead* scores the listings. *Gather The Material* fetches the opening hours, the ten best reviews and four public domain photographs. *Build The Site* hands the lot to a **DeepSeek Agent** with one directory it is allowed to write to. *Shoot The Page* photographs what it wrote, and *Send The Packet* mails you the screenshot and a CSV row.\n\nGoogle Maps has no email column, so the packet comes to **you**, with the shop\'s phone number in it. A person makes the call.' });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: '#### 🚀 Setup Guide\n\n**1.** **Scrape.do token.** Put a scrape.do API token into a Vault item (type: *API Key*) and select it in the two *Get Scrape.do Token* nodes - one inside **Find The Lead**, one inside **Gather The Material**. Free tier at `https://scrape.do`.\n\n**2.** **OpenRouter key.** Put an OpenRouter API key into a Vault item (type: *API Key*) and select it in the *Write The Page* agent\'s **API Key** property. The model is already `deepseek/deepseek-v4-pro-0813`.\n\n**3.** **Where the pages go.** The agent writes into `/home/robot/PitchSites`, and that path is set in two places: the agent\'s **Workspace** property and the *Locate The Page* function beside it. Change both, and create the folder.\n\n**4.** **Mailbox.** Put your SMTP details into a Vault item (type: *Email*) and select it in *Connect To The Mailbox*, then set **From** and **To** on *Mail The Packet*.\n\n**5.** **A robot with a desktop**, because *Shoot The Page* opens a real browser: `robomotion-deskbot connect -i <email> -w <workspace> -r <robot>`\n\n**6.** **Pick the niche.** One line in *Niche & Minimum Reviews* decides the whole run: `msg.niche` and `msg.min_reviews`. The stock photo search is a second line, `msg.photo_query` in *Shape The Facts*. Change them together - the pictures have to suit the trade.' });

  f.node('a41c07', 'Core.Trigger.Inject', 'Start', {})
    .then('3b9d42', 'Core.Flow.SubFlow', 'Find The Lead', { outputs: 2 });
  f.node('0d3e81', 'Core.Programming.Debug', 'Winner', { optDebugData: Message('winner') });
  f.node('4c7e10', 'Core.Flow.SubFlow', 'Gather The Material', {});
  f.node('2e85fa', 'Core.Flow.Stop', 'Nothing Worth Pitching', {});
  f.node('5d8f21', 'Core.Flow.SubFlow', 'Build The Site', {});
  f.node('6e9032', 'Core.Flow.SubFlow', 'Shoot The Page', {});
  f.node('7fa143', 'Core.Flow.SubFlow', 'Send The Packet', {});
  f.node('1c74b9', 'Core.Flow.Stop', 'Done', { delayBefore: 1 });

  f.edge('3b9d42', 0, '0d3e81', 0);
  f.edge('3b9d42', 0, '4c7e10', 0);
  f.edge('3b9d42', 1, '2e85fa', 0);
  f.edge('4c7e10', 0, '5d8f21', 0);
  f.edge('5d8f21', 0, '6e9032', 0);
  f.edge('6e9032', 0, '7fa143', 0);
  f.edge('7fa143', 0, '1c74b9', 0);
}).start();
