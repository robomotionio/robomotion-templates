import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Sign In", (f) => {
  f.node('c31001', 'Core.Flow.Begin', 'Begin', {})
    .then('c31002', 'Core.Vault.GetItem', 'Get The Portal Login', { outItem: Message('login'), optCredentials: Credential({ vaultId: '_', itemId: '_' }) })
    .then('c31003', 'Core.Vault.GetItem', 'Get The One Time Code', { outItem: Message('otp'), optCredentials: Credential({ vaultId: '_', itemId: '_' }) })
    .then('c31004', 'Core.Browser.Open', 'Open The Browser', {})
    .then('c31005', 'Core.Browser.OpenLink', 'Open The Portal', { inUrl: Custom('https://frs.robomotion.online/login') })
    .then('c31006', 'Core.Browser.TypeText', 'Type The Tax Number', { inSelector: Custom("//input[@data-testid='login-taxid']"), inText: JS('msg.login.username'), optWaitTimeout: Custom('20'), delayAfter: 1 })
    .then('c31007', 'Core.Browser.TypeText', 'Type The Password', { inSelector: Custom("//input[@data-testid='login-password']"), inText: JS('msg.login.password'), delayAfter: 1 })
    .then('c31008', 'Core.Browser.ClickElement', 'Continue', { inSelector: Custom("//button[@data-testid='login-submit']"), delayAfter: 1 })
    .then('c31009', 'Core.Browser.TypeText', 'Type The One Time Code', { inSelector: Custom("//input[@data-testid='otp-input']"), inText: JS('msg.otp.value'), optWaitTimeout: Custom('20'), delayAfter: 1 })
    .then('c3100a', 'Core.Browser.ClickElement', 'Verify', { inSelector: Custom("//button[@data-testid='otp-submit']"), delayAfter: 1 })
    .then('c3100b', 'Core.Flow.End', 'End', { sfPort: 0 })
    ;
});
