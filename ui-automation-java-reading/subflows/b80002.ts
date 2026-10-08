import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Open Acme ERP and sign in", (f) => {
  f.node('b8b001', 'Core.Flow.Begin', 'Begin', {})
    .then('b8b002', 'Core.Process.StartProcess', "Start Acme ERP", {
      inFilePath: Custom("C:/Acme/AcmeERP-Java/AcmeERP.exe"),
      inCustomArgs: ["--reset"],
      optBackground: true
    })
    .then('b8b003', 'Robomotion.JavaAutomation.Wait', "Wait for the sign-in window", {
      inTitle: Custom("Sign in"),
      inFullPath: Custom(""),
      optTimeout: 60
    })
    .then('b8b004', 'Robomotion.JavaAutomation.SetText', "Type the user ID", {
      inTitle: Custom("Sign in"),
      inFullPath: Custom("//text[name='User ID:']"),
      inText: Custom("trainee")
    })
    .then('b8b005', 'Robomotion.JavaAutomation.SetText', "Type the password", {
      inTitle: Custom("Sign in"),
      inFullPath: Custom("//password text[name='Password:']"),
      inText: Custom("AcmeTraining2026!")
    })
    .then('b8b006', 'Robomotion.JavaAutomation.ClickElement', "Sign in", {
      inTitle: Custom("Sign in"),
      inFullPath: Custom("//push button[name='Sign in']")
    })
    .then('b8b007', 'Robomotion.JavaAutomation.Wait', "Wait for the main window", {
      inTitle: Custom("^Acme ERP \\(Java Edition\\) - \\["),
      inFullPath: Custom(""),
      optTimeout: 20
    })
    .then('b8b008', 'Core.Flow.End', 'End', {})
    ;
});
