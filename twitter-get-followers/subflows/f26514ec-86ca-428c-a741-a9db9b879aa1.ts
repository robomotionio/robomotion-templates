import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Link', (f) => {
  f.node('b20c07', 'Core.Trigger.Catch', 'Catch', {
    optNodes: { ids: ['7464c5', '9da26c'], type: 'goto', all: false }
  });
  f.node('407966', 'Core.Flow.Begin', 'Begin', {});
  f.node('5e2706', 'Core.Flow.Label', 'End Of Page', {});
  f.node('1e51b4', 'Core.Programming.Function', 'Append Followers', {
    func: 'msg.index += msg.result.length;\nfor(var i = 0; i < msg.result.length;i++){\n  msg.followers.push(msg.result[i])\n}\nif (msg.followers.length > msg.limit){\n  msg.followers = msg.followers.slice(0,msg.limit+1)\n}\nreturn msg;'
  });
  f.node('bd869b', 'Core.Browser.RunScript', 'Scrape Followers', {
    func: 'var followers = document.querySelectorAll(`div[aria-label="Timeline: Followers"] > div > div`);\nconst results = [];\n\nfor (const follower of followers) {\n  	const profile = {}\n  	if (follower.querySelector("a > div > div > div > span")) {profile.name = follower.querySelector("a > div > div > div > span").textContent.trim()}\n  	if (follower.querySelector("a")) {profile.url = follower.querySelector("a").href.trim()}\n  	var bio = follower.querySelectorAll("div[dir=auto]")[4] || follower.querySelectorAll("div[dir=auto]")[3];\n  	if (bio) {profile.bio = bio.textContent.trim()}\n  	results.push(profile);\n}\n\nreturn results;\n',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('439e1e', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('a66fca', 'Core.Programming.Function', 'Create Table', {
    func: 'msg.table = {columns:["bio","name","url"],rows:[]}\nfor(var i = 0; i < msg.followers.length-1;i++){\n  var bio = msg.followers[i]["bio"] || ""\n  var name = msg.followers[i]["name"] ||  ""\n  var url = msg.followers[i]["url"] || ""\n \n  var temp = {\n              "bio":bio,\n              "name":name,\n              "url":url\n              }\n  msg.table.rows.push(temp)\n}\nmsg.a = msg.followers.length;\n\nreturn msg;'
  });
  f.node('aa3674', 'Core.Flow.SubFlow', 'Write To Excel', { subflow: 'd518a1cc-a437-4f96-aeb0-64be0aa84d81' });
  f.node('7464c5', 'Core.Programming.Function', 'Append Followers', {
    func: 'msg.index += msg.result.length;\nfor(var i = 0; i < msg.result.length;i++){\n  msg.followers.push(msg.result[i])\n}\nif (msg.followers.length > msg.limit){\n  msg.followers = msg.followers.slice(0,msg.limit+1)\n  throw "Limit Reached"\n}\nreturn msg;'
  })
    .then('70a1a1', 'Core.Flow.GoTo', 'Go To End Of Page', { optNodes: { ids: ['5e2706'], type: 'goto', all: false } });
  f.node('5090bc', 'Core.Browser.RunScript', 'Scrape Followers', {
    func: 'var followers = document.querySelectorAll(`div[aria-label="Timeline: Followers"] > div > div`);\nconst results = [];\n\nfor (const follower of followers) {\n  	const profile = {}\n  	if (follower.querySelector("a > div > div > div > span")) {profile.name = follower.querySelector("a > div > div > div > span").textContent.trim()}\n  	if (follower.querySelector("a")) {profile.url = follower.querySelector("a").href.trim()}\n  	var bio = follower.querySelectorAll("div[dir=auto]")[4] || follower.querySelectorAll("div[dir=auto]")[3];\n  	if (bio) {profile.bio = bio.textContent.trim()}\n  	results.push(profile);\n}\n\nreturn results;\n',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('0e3a09', 'Core.Browser.WaitElement', 'Wait Loading Followers', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//div[@aria-label=\'Loading Followers\']'),
    optCondition: 'appear-and-disappear',
    optTimeout: Custom('30')
  });
  f.node('9da26c', 'Core.Browser.WaitElement', 'Wait Loading', {
    inPageId: Message('page_id'),
    inSelectorType: 'xpath:position',
    inSelector: Custom('//div[@role=\'progressbar\']'),
    optCondition: 'appear-and-disappear',
    optTimeout: Custom('5')
  });
  f.node('df42a3', 'Core.Programming.Function', 'Init', { func: 'msg.followers = [];\n\nreturn msg;' });
  f.node('e570b4', 'Core.Browser.RunScript', 'Scroll Down', {
    func: 'window.scrollBy(0,50000)\nreturn results;\n',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('0c2c37', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('account_url'),
    outPageId: Message('page_id'),
    optSameTab: true
  });
  f.node('be64de', 'Core.Programming.Function', 'Prepare URL', {
    func: 'msg.account_url = "https://twitter.com/" + msg.twitter_account +  "/followers";\nreturn msg;'
  });

  f.edge('e570b4', 0, '9da26c', 0);
  f.edge('5e2706', 0, 'e570b4', 0);
  f.edge('9da26c', 0, '5090bc', 0);
  f.edge('0c2c37', 0, 'df42a3', 0);
  f.edge('0e3a09', 0, 'df42a3', 0);
  f.edge('5090bc', 0, '7464c5', 0);
  f.edge('a66fca', 0, 'aa3674', 0);
  f.edge('aa3674', 0, '439e1e', 0);
  f.edge('1e51b4', 0, 'bd869b', 0);
  f.edge('b20c07', 0, 'bd869b', 0);
  f.edge('a66fca', 0, '1e51b4', 0);
  f.edge('0e3a09', 0, 'e570b4', 0);
  f.edge('407966', 0, 'be64de', 0);
  f.edge('0c2c37', 0, 'be64de', 0);
});
