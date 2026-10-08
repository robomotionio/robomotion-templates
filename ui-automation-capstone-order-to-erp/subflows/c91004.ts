import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

// The logon box and the Invoices tab, as the Image Inspector captured them.
const IMG_PASSWORD = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAAAyCAIAAAA88MUKAAAB1ElEQVR4Ae3BMRFdMQwEwDsKroRFAIzFlbgE0V0TLIGhgHjfhWe0y8jCTWcv25IwfoGRhZvOXrYlYfwCIws3nb1sS8L4BUYWbvr39w/G7zCyMN7ByMJ4ByML4x2MLIx3MLIw3sHIwngHIwvjHYwsjHcwsnDT2QvjdxhZuOnsZRvjRxhZuOnsZVsSxi8wsnDT2cu2JIxfYGThprOXbUkASHY3xgeMLNx09rItCQDJ7sb4gJGFm85etiUBINndGB8wsnDT2cu2JAAkuxvjA0YWbjp72ZYEgGR3Y3zAyMJNZy/bkgCQ7G6MDxhZuOnsZVsSAJLdjfEBIws3nb1sSwJAsrsxPmBk4aazl21JAEh2N8YHjCzcdPayLQkAye7G+ICRhZvOXrYlASDZ3RgfMLJw09nLtiQAJLsb4wNGFm46e9mWBIBkd2N8wMjCTWcv25IAkOxujA8YWbjp7GVbEgCS3Y3xASMLN529bEsCQLK7MT5gZOGms5dtSRi/wMjCTWcv25IwfoGRhZvOXrYlYfwCIws3/fv7B+N3GFkY72BkYbyDkYXxDkYWxjsYWRjvYGRhvIORhfEORhbGOxhZGO9gZGG8g5GF8Q5GFsY7GFkY72BkYbzjP/xx26VCPR8CAAAAAElFTkSuQmCC";
const IMG_INVOICES_TAB = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAMCAIAAAB0ltMZAAABKElEQVQ4EcXBIapYURQDwNz9RERm/yoyIgsqHHhQqGpF/8xbgx/11uBHvTUAKOOswT+hvAZ/763BobwG/91bg0N5DQDK+KwBQHkNDuU1ACjjrAFAeQ0AyjhrAFDGWYNDGWcNgLcGh/IaAJTX4FBeQ3kNDuU1lNfgUF5DeQ3lNfhQXoNDeQ3lNfjNW4NDeQ0AymtwKK8BQHkN5TUAKK/BobyG8hrKa/ChjN+soQxgDT5vDQ7lNQAor8GhvAYA5TWU1wCgvAaH8hrKayivwYfyGvyBMoA1AN4aHMprAFBeg0N5DQ7lNTiU1+BQXkN5DeU1+FBeg0N5DT6U1wB4awBQxllDeQ0O5TU4lNfgQxlnDQDKawBQxlkDgDLOGgCUcdbgvDX4UW8NftQv5BvjHQodE9MAAAAASUVORK5CYII=";

subflow.create("Open the finance system", (f) => {
  f.node('c93000', 'Core.Flow.Begin', "Begin", {

    })
    .then('c93001', 'Core.Process.StartProcess', "Start the remote desktop", {
      inFilePath: Custom("C:/Acme/AcmeRemote/AcmeRemote.exe"),
      inCustomArgs: ["--training", "--auto-erp", "--size", "1240x960", "--pos", "16,16"],
      optBackground: true
    })
    .then('c93002', 'Robomotion.ImageAutomation.Window.FocusWindow', "Wait for the remote desktop", {
      inTitle: Custom("Remote Desktop Connection"),
      optWaitTimeout: Custom("30")
    })
    .then('c93003', 'Robomotion.ImageAutomation.Image.ClickType', "Type the password", {
      image: IMG_PASSWORD,
      deltaX: 58,
      deltaY: 25,
      inText: Custom("AcmeTraining2026!"),
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optClear: true,
      optPressEnter: true,
      optWindow: "Remote Desktop Connection"
    })
    .then('c93004', 'Robomotion.ImageAutomation.OCR.WaitText', "Wait for Acme ERP", {
      inSearchText: Custom("Customers"),
      optTimeout: Custom("40"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c93005', 'Robomotion.ImageAutomation.Image.ClickImage', "Open Invoices", {
      image: IMG_INVOICES_TAB,
      deltaX: 21,
      deltaY: 6,
      optConfidence: Custom("0.9"),
      optWaitTimeout: Custom("15"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c93006', 'Robomotion.ImageAutomation.OCR.WaitText', "Wait for the invoices", {
      inSearchText: Custom("Outstanding"),
      optTimeout: Custom("20"),
      optWindow: "Remote Desktop Connection"
    })
    .then('c930ff', 'Core.Flow.End', 'End', {})
    ;
});
