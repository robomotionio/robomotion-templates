import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

// The password box of the logon screen, as the Image Recorder captured it.
const IMG_PASSWORD = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAAAyCAIAAAA88MUKAAAB1ElEQVR4Ae3BMRFdMQwEwDsKroRFAIzFlbgE0V0TLIGhgHjfhWe0y8jCTWcv25IwfoGRhZvOXrYlYfwCIws3nb1sS8L4BUYWbvr39w/G7zCyMN7ByMJ4ByML4x2MLIx3MLIw3sHIwngHIwvjHYwsjHcwsnDT2QvjdxhZuOnsZRvjRxhZuOnsZVsSxi8wsnDT2cu2JIxfYGThprOXbUkASHY3xgeMLNx09rItCQDJ7sb4gJGFm85etiUBINndGB8wsnDT2cu2JAAkuxvjA0YWbjp72ZYEgGR3Y3zAyMJNZy/bkgCQ7G6MDxhZuOnsZVsSAJLdjfEBIws3nb1sSwJAsrsxPmBk4aazl21JAEh2N8YHjCzcdPayLQkAye7G+ICRhZvOXrYlASDZ3RgfMLJw09nLtiQAJLsb4wNGFm46e9mWBIBkd2N8wMjCTWcv25IAkOxujA8YWbjp7GVbEgCS3Y3xASMLN529bEsCQLK7MT5gZOGms5dtSRi/wMjCTWcv25IwfoGRhZvOXrYlYfwCIws3/fv7B+N3GFkY72BkYbyDkYXxDkYWxjsYWRjvYGRhvIORhfEORhbGOxhZGO9gZGG8g5GF8Q5GFsY7GFkY72BkYbzjP/xx26VCPR8CAAAAAElFTkSuQmCC";

subflow.create('Open Acme ERP over a slow session', (f) => {
  f.node('c9b001', 'Core.Flow.Begin', 'Begin', {})
    .then('c9b002', 'Core.Process.StartProcess', "Start AcmeRemote", {
      inFilePath: Custom("C:/Acme/AcmeRemote/AcmeRemote.exe"),
      inCustomArgs: ["--training", "--auto-erp", "--size", "1240x960", "--pos", "16,16", "--latency", "1500", "--drop-fast-keys", "25"],
      optBackground: true
    })
    .then('c9b003', 'Robomotion.ImageAutomation.Window.FocusWindow', "Wait for the remote desktop", {
      inTitle: Custom("Remote Desktop Connection"),
      optWaitTimeout: Custom("30")
    })
    .then('c9b004', 'Robomotion.ImageAutomation.Image.ClickType', "Type the password", {
      image: IMG_PASSWORD,
      deltaX: 58,
      deltaY: 25,
      inText: Custom("AcmeTraining2026!"),
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optClear: true,
      optPressEnter: true,
      optDelayPerKeyMs: Custom("60"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c9b005', 'Robomotion.ImageAutomation.OCR.WaitText', "Wait for Acme ERP", {
      inSearchText: Custom("Customers"),
      optTimeout: Custom("40"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c9b006', 'Core.Flow.End', 'End', {})
    ;
});
