import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('e34b431f-cde8-442e-b4c1-5df6eab546f1', 'Imported Send Get Request', (f) => {
  f.node('97b442', 'Core.Flow.Comment', 'Comment', { optText: '# Send Get Request How-To\n\nThis template sends a GET request to a sample service and displays its response.\n\n## Usage Steps\n\n### 1. Run the Flow\n\nSimply execute the flow to send a GET request to the default sample service.\n\n### 2. (Optional) Use Your Own Service\n\nIf you want to use your own service, edit the Config Node and update the `msg.service_address` field with your service URL. For example: `https://api.yourservice.com/endpoint`\n\n## Result\n\nWhen the flow is executed, the template will send a GET request to the specified service and display the response data.' });
  f.node('8d3930', 'Core.Trigger.Inject', 'Start', {})
    .then('3f6c54', 'Core.Programming.Function', 'Config', { func: 'msg.service_address = "https://ifconfig.me";\nreturn msg;' })
    .then('6a1081', 'Core.Net.HttpRequest', 'Send Request', { optMethod: 'get', optUrl: Message('service_address') })
    .then('25f567', 'Core.Dialog.MessageBox', 'Show IP Adress', { inTitle: Custom('Your IP Address'), inText: Message('resp') })
    .then('76405f', 'Core.Flow.Stop', 'Stop', {});
}).start();