import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('4b797c62-071a-4539-b321-65afefa7b2d2', 'Countdown', (f) => {
  f.node('b24fd8', 'Core.Flow.Comment', 'Comment', {
    optText: '##### Countdown How-To \n\nThis template uses the *Net* nodes to count down for a specified date\nstarting from the current time.\n\nFollow these steps to test this template;\n\n**1.** Edit the Config Node\n\n**2.** Set the msg.year, msg.month, msg.day, msg.hour, msg.min, msg.sec fields\nto corresponding values for the date you want to count down.\n\n**3.** Go to `http://localhost:9090/` using your favorite browser.\n'
  });
  f.node('4aaf1c', 'Core.Net.HttpIn', 'Http In', {
    outBody: Message('body'),
    outHeaders: Message('headers'),
    outCookies: Message('cookies'),
    optMethod: 'GET',
    optEndpoint: '/'
  })
    .then('3cae94', 'Core.Programming.Function', 'Config', {
    func: 'msg.year = 2022,\nmsg.month = 1,\nmsg.day = 1,\nmsg.hour = 0,\nmsg.min = 0,\nmsg.sec = 0;\nreturn msg;'
  })
    .then('be6272', 'Core.Net.HttpTemplate', 'Http Template', {
    outRendered: Message('body'),
    func: '<html>\n  <head>\n    <title>Countdown</title>\n    <style>\n      body {\n        display: flex;\n        align-items: center;\n      }\n      #container {\n        margin: 0 auto;\n        width: fit-content;\n      }\n      .num {\n        font-size: 24;\n        font-weight: 500;\n        font-family: monospace;\n        padding: 12;\n      }\n      .desc {\n        width: 72;\n        text-align: center;\n      }\n      .separator {\n        display: inline;\n        margin: 1;\n      }\n    </style>\n    <script>\n      function onLoad() {\n        getDiff();\n        setInterval(tick, 1000);\n      }\n      \n      function getDiff() {\n        const now = Date.now();\n        let diff = (new Date(Date.UTC({{year}}, {{month}}-1, {{day}}, {{hour}}, {{min}}, {{sec}})) - now)/1000;\n        const years = Math.floor(diff / (60*60*24*365)); diff -= years * (60*60*24*365);\n        const months = Math.floor(diff / (60*60*24*30)); diff -=  months * (60*60*24*30);\n        const days = Math.floor(diff / (60*60*24)); diff -= days * (60*60*24);\n        const hours = Math.floor(diff / (60*60)); diff -= hours * (60*60);\n        const mins = Math.floor(diff / 60); diff -= mins * 60;\n        const sec = Math.floor(diff);\n        document.getElementById("years").innerHTML = years.toString().padStart(2, \'0\');\n        document.getElementById("months").innerHTML = months.toString().padStart(2, \'0\');\n        document.getElementById("days").innerHTML = days.toString().padStart(2, \'0\');\n        document.getElementById("hours").innerHTML = hours.toString().padStart(2, \'0\');\n        document.getElementById("mins").innerHTML = mins.toString().padStart(2, \'0\');\n        document.getElementById("sec").innerHTML = sec.toString().padStart(2, \'0\');\n        const elems = document.getElementsByClassName("separator");\n        for (let i = 0; i < elems.length; i++) elems[i].innerHTML = sec%2 === 0 ? \':\' : \' \';\n      }\n      \n      function tick() {\n        getDiff();\n      }\n    </script>\n  </head>\n  <body onLoad="onLoad()">\n    <div id="container">\n      <div style="margin: 8">\n        <span id="years" class="num"></span>\n        <pre class="separator"></pre>\n        <span id="months" class="num"></span>\n        <pre class="separator"></pre>\n        <span id="days" class="num"></span>\n        <pre class="separator"></pre>\n        <span id="hours" class="num"></span>\n        <pre class="separator"></pre>\n        <span id="mins" class="num"></span>\n        <pre class="separator"></pre>\n        <span id="sec" class="num"></span>\n      </div>\n      \n      <div style="display: flex;">\n        <div class="desc">years</div>\n        <div class="desc">months</div>\n        <div class="desc">days</div>\n        <div class="desc">hours</div>\n        <div class="desc">minutes</div>\n        <div class="desc">seconds</div>\n      </div>\n    </div>\n  </body>\n</html>\n'
  })
    .then('a92bc8', 'Core.Net.HttpOut', 'Http Out', {
    inBody: Message('body'),
    inHeaders: Message('headers'),
    inCustomHeaders: [{"name": "Content-Type", "value": "text/html"}],
    inCookies: Message('cookies'),
    inCustomCookies: [],
    inStatus: Custom('200')
  });
}).start();
