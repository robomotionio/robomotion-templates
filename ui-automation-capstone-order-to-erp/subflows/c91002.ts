import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Read today's web orders", (f) => {
  f.node('c92000', 'Core.Flow.Begin', "Begin", {

    })
    .then('c92001', 'Core.Browser.Open', "Open headless Chrome", {
      optBrowser: "headlesschrome",
      optFullScreen: false,
      optMaximized: true,
      outBrowserId: Message("browser_id")
    })
    .then('c92002', 'Core.Browser.OpenLink', "Open the sign-in page", {
      inBrowserId: Message("browser_id"),
      inPageId: Message("page_id"),
      inUrl: Custom("https://acme-erp.robomotion.online/login"),
      optSameTab: false,
      optTimeout: 30,
      outPageId: Message("page_id")
    })
    .then('c92003', 'Core.Browser.TypeText', "Type the user ID", {
      inPageId: Message("page_id"),
      inSelector: Custom("//input[@id=\"user-id\"]"),
      inSelectorType: "xpath:position",
      inText: Custom("trainee"),
      optClearText: true,
      optEnter: false,
      optKeysPerMinute: Custom("300"),
      optSimulateHuman: true,
      optWaitTimeout: Custom("5")
    })
    .then('c92004', 'Core.Browser.TypeText', "Type the password", {
      inPageId: Message("page_id"),
      inSelector: Custom("//input[@id=\"password\"]"),
      inSelectorType: "xpath:position",
      inText: Custom("AcmeTraining2026!"),
      optClearText: true,
      optEnter: false,
      optKeysPerMinute: Custom("300"),
      optSimulateHuman: true,
      optWaitTimeout: Custom("5")
    })
    .then('c92005', 'Core.Browser.ClickElement', "Sign in", {
      inPageId: Message("page_id"),
      inSelector: Custom("//button[@type=\"submit\"]"),
      inSelectorType: "xpath:position",
      optClickType: "singleClick",
      optWaitTimeout: Custom("5")
    })
    .then('c92006', 'Core.Browser.ClickElement', "Open Incoming", {
      inPageId: Message("page_id"),
      inSelector: Custom("//a[normalize-space()=\"Incoming\"]"),
      inSelectorType: "xpath:position",
      optClickType: "singleClick",
      optWaitTimeout: Custom("5")
    })
    .then('c92007', 'Core.Browser.WaitElement', "Wait for the orders", {
      inPageId: Message("page_id"),
      inSelector: Custom("//table[@aria-label=\"Incoming web orders\"]"),
      inSelectorType: "xpath:position",
      optCondition: "to-appear",
      optTimeout: Custom("20")
    })
    .then('c92008', 'Core.Browser.ScrapeTable', "Read the incoming orders", {
      inPageId: Message("page_id"),
      inSelector: Custom("//table[@aria-label=\"Incoming web orders\"]"),
      inSelectorType: "xpath",
      optCustomExcludedColumns: [],
      optExcludedColumns: Message("columns"),
      optVertical: false,
      optWaitTimeout: Custom("5"),
      outTable: Message("incoming")
    })
    .then('c92009', 'Core.Browser.Close', "Close the browser", {
      inBrowserId: Message("browser_id")
    })
    .then('c920ff', 'Core.Flow.End', 'End', {})
    ;
});
