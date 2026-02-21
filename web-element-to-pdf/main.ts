import { flow, Message } from '@robomotion/sdk';

flow.create('a63781a9-0a43-4e40-8d85-922c5a069f25', 'Imported Web Element To Pdf', (f) => {
  f.node('dbe53b', 'Core.Flow.Comment', 'Comment', { optText: '# Web Element To PDF How-To\n\nThis template converts any web element to a PDF file.\n\n## Usage Steps\n\n### 1. Edit the Config Node\n\nClick on the Config Node to open the settings panel.\n\n### 2. Set the Website URL\n\nSet the `msg.url` field to the URL of the website containing the element you want to convert. For example: `https://www.example.com/page`\n\n### 3. Set the Element XPath\n\nSet the `msg.xpath` field to the XPath of the specific element you want to convert to PDF. For example: `//*[@id="content"]/div[1]`\n\n## Result\n\nWhen the flow is executed, the template will capture the specified web element and save it as a PDF file.' });
  f.node('cc3828', 'Core.Trigger.Inject', 'Start', {})
    .then('9cb35c', 'Core.Programming.Function', 'Config', { func: 'msg.url = "https://en.wikipedia.org/wiki/Robotic_process_automation"\nmsg.xpath = \'//*[@id="content"]\';\nreturn msg;' })
    .then('fe6ab4', 'Core.Browser.Open', 'Open Browser', {})
    .then('b83ef1', 'Core.Browser.OpenLink', 'Open Link', { inUrl: Message('url') })
    .then('61971a', 'Core.Browser.WaitElement', 'Wait Element', { inSelector: Message('xpath') })
    .then('91612c', 'Core.Browser.RunScript', 'Inject Html 2 PDF', { func: '// Create a new <script> element\nvar script = document.createElement(\'script\');\n\n// Specify the type of the script being added\nscript.type = \'application/javascript\';\n\n// Set the source URL to load the html2pdf.js library from a CDN\nscript.src = \'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js\';\n\n// Append the <script> element to the document <head> so the library loads\ndocument.head.appendChild(script);\n\n\n' })
    .then('4a1125', 'Core.Browser.RunScript', 'Convert Element to PDF', { func: '//Takes an xpath, and returns the first matched web element\nfunction getElementByXpath(path) {\n  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n}\n\nvar elem = getElementByXpath(msg.xpath)\nif(elem){\n  html2pdf(elem)  \n}else{\n  alert("Element not found")\n}\n', delayBefore: 5 })
    .then('2e0b47', 'Core.Flow.Stop', 'Stop', { delayBefore: 10 });
}).start();