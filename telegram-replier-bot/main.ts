import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('e1a5ba19-2d48-41f7-b613-52a5f59de202', 'Telegram Replier Bot', (f) => {
  f.node('b2595b', 'Core.Flow.Comment', 'Comment', {
    optText: '## Telegram Replier Bot\n\nReceives message from telegram and replies\n\n### How it Works?\n\nFollow these steps to test this template;\n\n**1.** Go to Flow Designer and press package icon above the node palette.\n\n**2.** You should see Telegram Bot package icon, install it.\n\n**3.** Edit the Config Node.\n\n**4.** Set the msg.answer field to your message.\n\n**5.** Set the Bot Token credential for Receive Message and Connect nodes to access your bot. See [here](https://core.telegram.org/bots#3-how-do-i-create-a-bot) for more information.\n'
  });
  f.node('121d0f', 'Robomotion.TelegramBot.ReceiveMessage', 'Receive Message', {
    outMessage: Message('message'),
    optChatId: Custom('0'),
    optSenderId: Custom('0'),
    optToken: Custom('{'vaultId': '_', 'itemId': '_'}')
  })
    .then('b4c540', 'Core.Programming.Function', 'Config', {
    func: 'msg.replyMessage = "Customer support will be back Monday during business hours and they may have suggestions."; // Bot\'s reply.\nmsg.incomingMessage = msg.message.message;\nmsg.messageId = msg.incomingMessage.message_id;\nmsg.chatId = msg.incomingMessage.chat.id;\nreturn msg;'
  })
    .then('1b432e', 'Robomotion.TelegramBot.Connect', 'Connect', {
    outClientId: Message('client_id'),
    optToken: Custom('{'vaultId': '_', 'itemId': '_'}')
  })
    .then('7dd359', 'Robomotion.TelegramBot.SendMessage', 'Send Message', {
    inChatId: Message('chatId'),
    inClientId: Message('client_id'),
    inMessage: Message('replyMessage'),
    optReplyId: Message('messageId')
  })
    .then('8bf1a0', 'Robomotion.TelegramBot.Disconnect', 'Disconnect', { inClientId: Message('client_id') })
    .then('a9a197', 'Core.Programming.Debug', 'Debug', {
    optDebugData: Message(''),
    optActive: true,
    optSysConsole: false
  });
}).start();
