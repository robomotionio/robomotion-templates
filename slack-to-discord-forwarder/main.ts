import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('4e073b0c-f824-4fc3-997a-5547ba74906e', 'Slack To Discord Forwarder', (f) => {
  f.node('21dcfb', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Slack to Discord Forwarder\n\nThis template uses *Slack* and *Discord Bot* nodes to forward messages.\n\nFollow these steps to test this template;\n\n**1.** Set the slack environment and take the bot token by [this](https://docs.robomotion.io/getting-started/tutorials/slack-integration) instructions.\n\n**2.** You will need to enable socket mode and get application level token too.\n\n**3.** To enable Socket Mode, navigate to the Socket Mode tab under Settings in the left panel. Toggle the button next to Enable Socket Mode.\n\n**4.** After clicking Generate you will receive an application level token and you need to add it to your vault as a new API Key/Token item.\n\n**5.** Navigate to Event Subscriptions under Features in the left panel and enable events after that expand the subscribe to bot events and add message.channels event.\n\n**6.** To creating a Discord bot you can follow [this](https://discordpy.readthedocs.io/en/stable/discord.html) link.\n\n**7.** Edit the Config Node'
  });
  f.node('12fc65', 'Core.Programming.Function', 'Config', {
    func: '//If you want to filter messages that comes from Slack you will need to Channel Id and User Id. You can find them in slack by right click and copy link.(for ex: https://channel-123.slack.com/team/UABCDE -> the last part of url is user id. Also once you receive a message, you can take a look at debug for this kind of informations.)\nmsg.discordChannelId = ""; // Discord Channel that message will be sent. You can take it by right click and clicking copy id from Discord.\nreturn msg;'
  })
    .then('954932', 'Robomotion.DiscordBot.Connect', 'Connect', {
    outClientId: Message('client_id'),
    optToken: Custom('{'vaultId': '_', 'itemId': '_'}')
  })
    .then('8ff76a', 'Robomotion.DiscordBot.SendMessage', 'Send Message', {
    inChannelId: Message('discordChannelId'),
    inClientId: Message('client_id'),
    inMessage: Message('message.text')
  })
    .then('a9dfee', 'Robomotion.DiscordBot.Disconnect', 'Disconnect', { inClientId: Message('client_id') })
    .then('6bbad4', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
  f.node('bedb37', 'Robomotion.Slack.ReceiveMessage', 'Receive Message', {
    outClientID: Message('client_id_slack'),
    outMessage: Message('message'),
    optAppToken: Custom('{'vaultId': '_', 'itemId': '_'}'),
    optChannelId: Custom(''),
    optToken: Custom('{'vaultId': '_', 'itemId': '_'}'),
    optUserId: Custom('')
  });

  f.edge('bedb37', 0, '12fc65', 0);
}).start();
