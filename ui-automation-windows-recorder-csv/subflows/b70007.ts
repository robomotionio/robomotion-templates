import { subflow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

subflow.create("Add the customer", (f) => {
  f.node('b7c001', 'Core.Flow.Begin', 'Begin', {})
    .then('b7c002', 'Robomotion.WindowsAutomation.Click', "Click New customer", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/ButtonControl[@id='btnNewCustomer']"),
      optMouseButton: "left"
    })
    .then('b7c003', 'Robomotion.WindowsAutomation.SetText', "Type the name", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpGeneral']/EditControl[@id='txtName']"),
      inText: Message("customer.name"),
      optEmulateTyping: true
    })
    .then('b7c004', 'Robomotion.WindowsAutomation.SetText', "Type the e-mail", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpGeneral']/EditControl[@id='txtEmail']"),
      inText: Message("customer.email"),
      optEmulateTyping: true
    })
    .then('b7c005', 'Robomotion.WindowsAutomation.SetCombobox', "Choose the country", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpGeneral']/ComboBoxControl[@id='cboCountry']"),
      inValue: Message("customer.country")
    })
    .then('b7c006', 'Robomotion.WindowsAutomation.Click', "Choose the type", {
      inSelector: JS("\"//WindowControl[@id='frmMain']//RadioButtonControl[@name='\" + msg.customer.type + \"']\""),
      optMouseButton: "left"
    })
    .then('b7c007', 'Robomotion.WindowsAutomation.SetCheckbox', "Set VIP", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpGeneral']/CheckBoxControl[@id='chkVip']"),
      inValue: JS("msg.customer.vip === 'yes'")
    })
    .then('b7c008', 'Robomotion.WindowsAutomation.Click', "Double-click the credit limit", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpGeneral']/SpinnerControl[@id='numCreditLimit']/EditControl[@name='Credit limit:' and starts-with(@class, 'WindowsForms10.Edit.')]"),
      optMouseButton: "double_left"
    })
    .then('b7c009', 'Robomotion.WindowsAutomation.SetText', "Type the credit limit", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpGeneral']/SpinnerControl[@id='numCreditLimit']/EditControl[@name='Credit limit:' and starts-with(@class, 'WindowsForms10.Edit.')]"),
      inText: Message("customer.credit_limit"),
      optEmulateTyping: true
    })
    .then('b7c00a', 'Robomotion.WindowsAutomation.Click', "Edit the billing address", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpBilling']/ButtonControl[@id='button3']"),
      optMouseButton: "left"
    })
    .then('b7c00b', 'Robomotion.WindowsAutomation.SetText', "Type the street", {
      inSelector: Custom("//WindowControl[@id='frmAddress']//EditControl[@id='txtStreet']"),
      inText: Message("customer.billing_street"),
      optEmulateTyping: true
    })
    .then('b7c00c', 'Robomotion.WindowsAutomation.SetText', "Type the city", {
      inSelector: Custom("//WindowControl[@id='frmAddress']//EditControl[@id='txtCity']"),
      inText: Message("customer.billing_city"),
      optEmulateTyping: true
    })
    .then('b7c00d', 'Robomotion.WindowsAutomation.Click', "Click OK", {
      inSelector: Custom("//WindowControl[@id='frmAddress']//ButtonControl[@id='btnOk']"),
      optMouseButton: "left"
    })
    .then('b7c00e', 'Robomotion.WindowsAutomation.Click', "Same as billing address", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/GroupControl[@id='grpShipping']/CheckBoxControl[@id='chkSameAsBilling']"),
      optMouseButton: "left"
    })
    .then('b7c00f', 'Robomotion.WindowsAutomation.Click', "Click Save", {
      inSelector: Custom("//WindowControl[@id='frmMain']//TabControl[@id='tabMain']/PaneControl[@id='tabCustomers']/PaneControl[starts-with(@class, 'WindowsForms10.Window.')]/ButtonControl[@id='btnSave']"),
      optMouseButton: "left"
    })
    .then('b7c010', 'Robomotion.WindowsAutomation.Click', "Close the message", {
      inSelector: Custom("//WindowControl[@name='Acme ERP' and @class='#32770']//ButtonControl[@id='2']"),
      optMouseButton: "left"
    })
    .then('b7c011', 'Core.Flow.End', 'End', {})
    ;
});
