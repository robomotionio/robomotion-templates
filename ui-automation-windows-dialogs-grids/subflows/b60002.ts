import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create('Open Acme ERP and sign in', (f) => {
  f.node('b6b001', 'Core.Flow.Begin', 'Begin', {})
    .then('b6b002', 'Core.Process.StartProcess', 'Start Acme ERP', {
      inFilePath: Custom('C:/Acme/AcmeERP-Windows/AcmeERP.exe'),
      inCustomArgs: ['--reset'],
      optBackground: true
    })
    .then('b6b003', 'Robomotion.WindowsAutomation.WaitWindow', 'Wait for the sign-in window', {
      inSelector: Custom("//WindowControl[starts-with(@class, 'WindowsForms10.Window.') and ends-with(@name, ' - Sign in')]"),
      optCondition: 'appear'
    })
    .then('b6b004', 'Robomotion.WindowsAutomation.SetText', 'Type the user ID', {
      inSelector: Custom("//EditControl[@automationid='txtUser']"),
      inText: Custom('trainee')
    })
    .then('b6b005', 'Robomotion.WindowsAutomation.SetText', 'Type the password', {
      inSelector: Custom("//EditControl[@automationid='txtPassword']"),
      inText: Custom('AcmeTraining2026!')
    })
    .then('b6b006', 'Robomotion.WindowsAutomation.Click', 'Sign in', {
      inSelector: Custom("//ButtonControl[@automationid='btnSignIn']"),
      optShowWindow: true
    })
    .then('b6b007', 'Core.Flow.End', 'End', {})
    ;
});
