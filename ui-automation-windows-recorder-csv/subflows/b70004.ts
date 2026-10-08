import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Open Acme ERP and sign in", (f) => {
  f.node('b7b001', 'Core.Flow.Begin', 'Begin', {})
    .then('b7b002', 'Core.Process.StartProcess', "Start Acme ERP", {
      inFilePath: Custom("C:/Acme/AcmeERP-Windows/AcmeERP.exe"),
      optBackground: true
    })
    .then('b7b003', 'Robomotion.WindowsAutomation.WaitWindow', "Wait for the sign-in window", {
      inSelector: Custom("//WindowControl[@id='frmSignIn']"),
      optCondition: "appear"
    })
    .then('b7b004', 'Robomotion.WindowsAutomation.SetText', "Type the user ID", {
      inSelector: Custom("//WindowControl[@id='frmSignIn']//EditControl[@id='txtUser']"),
      inText: Custom("trainee")
    })
    .then('b7b005', 'Robomotion.WindowsAutomation.SetText', "Type the password", {
      inSelector: Custom("//WindowControl[@id='frmSignIn']//EditControl[@id='txtPassword']"),
      inText: Custom("AcmeTraining2026!")
    })
    .then('b7b006', 'Robomotion.WindowsAutomation.Click', "Sign in", {
      inSelector: Custom("//WindowControl[@id='frmSignIn']//ButtonControl[@id='btnSignIn']"),
      optMouseButton: "left"
    })
    .then('b7b007', 'Core.Flow.End', 'End', {})
    ;
});
