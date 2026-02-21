import { flow, Custom, Message } from '@robomotion/sdk';

flow.create('838a2cc0-2527-4586-8d69-7bdc1db1ef54', 'Imported BMI Calculator', (f) => {
  f.node('e0c354', 'Core.Flow.Comment', 'Comment', { optText: '##### BMI Calculator How-To \n\nThis template uses *Dialog* and *Function* nodes to calculate Body Mass Index (BMI).\n\nFollow these steps to test this template;\n\n**1.** You are ready to go, just give a try.' });
  f.node('e26232', 'Core.Trigger.Inject', 'Inject', {})
    .then('fd1dd3', 'Core.Dialog.InputBox', 'Weight Input', {
    inText: Custom('How much do you weight in kg?'),
    inTitle: Custom('BMI Calculator'),
    outText: Message('weight'),
    optDefault: Custom('70')
  })
    .then('9f6bf0', 'Core.Dialog.InputBox', 'Height Input', {
    inText: Custom('What is your height in cm?'),
    inTitle: Custom('BMI Calculator'),
    outText: Message('height'),
    optDefault: Custom('170')
  })
    .then('61ea9a', 'Core.Programming.Function', 'Calculate BMI', { func: 'msg.bmi = msg.weight / (msg.height*msg.height/10000);\nmsg.bmi = msg.bmi.toFixed(2);\nmsg.message = `Your Body Mass Index (BMI) is ${msg.bmi}`;\nreturn msg;' })
    .then('1e18ea', 'Core.Dialog.MessageBox', 'Show BMI', { inText: Message('message'), inTitle: Custom('BMI Calculator') })
    .then('4491b3', 'Core.Flow.Stop', 'Stop', {});
}).start();