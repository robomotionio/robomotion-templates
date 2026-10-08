import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Open Acme ERP", (f) => {
  f.node('c94000', 'Core.Flow.Begin', "Begin", {

    })
    .then('c94001', 'Core.Process.StartProcess', "Start Acme ERP", {
      inFilePath: Custom("C:/Acme/AcmeERP-Windows/AcmeERP.exe"),
      inCustomArgs: ["--reset"],
      optBackground: true
    })
    .then('c94002', 'Robomotion.WindowsAutomation.WaitWindow', "Wait for the Sign in window", {
      inSelector: Custom("//WindowControl[starts-with(@class, 'WindowsForms10.Window.') and ends-with(@name, ' - Sign in')]"),
      optCondition: "appear"
    })
    .then('c94003', 'Robomotion.WindowsAutomation.SetText', "Type the user ID", {
      inSelector: Custom("//EditControl[@id='txtUser']"),
      inText: Custom("trainee")
    })
    .then('c94004', 'Robomotion.WindowsAutomation.SetText', "Type the password", {
      inSelector: Custom("//EditControl[@id='txtPassword']"),
      inText: Custom("AcmeTraining2026!")
    })
    .then('c94005', 'Robomotion.WindowsAutomation.Click', "Sign in", {
      inSelector: Custom("//ButtonControl[@id='btnSignIn']"),
      optShowWindow: true
    })
    .then('c940ff', 'Core.Flow.End', 'End', {})
    ;
});
