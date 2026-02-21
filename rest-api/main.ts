import { flow, Custom } from '@robomotion/sdk';

flow.create('d4b17a87-1053-4175-8ea7-27dd7857351a', 'Imported REST API', (f) => {
  f.node('59c52c', 'Core.Flow.Comment', 'Comment', { optText: '# REST Template How-To\n\nThis template uses the *Net > Http* nodes to create a REST API. The default robot runs on `http://localhost:9090`\n\n## Usage Steps\n\n### 1. Test GET /date Endpoint\n\nSend a GET request to retrieve the current date:\n```bash\ncurl http://localhost:9090/date\n```\n\n### 2. Test POST /echo Endpoint\n\nSend a POST request with JSON data to test the echo functionality:\n```bash\ncurl -X POST -d \'{"name":"john"}\' http://localhost:9090/echo\n```\n\n## Result\n\nWhen the flow is executed, it will create a REST API server on your local machine. You can interact with the endpoints using the curl commands above or any HTTP client.' });
  f.node('1e8aaa', 'Core.Net.HttpIn', 'POST /echo', { optMethod: 'POST', optEndpointV2: Custom('/echo') });
  f.node('6b2005', 'Core.Net.HttpIn', 'GET /date', { optEndpointV2: Custom('/date') })
    .then('d6c12a', 'Core.Programming.Function', 'Get Date', { func: 'msg.body =  {\n  "date": new Date()\n};\n\nreturn msg;' });
  f.node('19514a', 'Core.Net.HttpOut', 'Http Response', {});

  f.edge('1e8aaa', 0, '19514a', 0);
  f.edge('d6c12a', 0, '19514a', 0);
}).start();