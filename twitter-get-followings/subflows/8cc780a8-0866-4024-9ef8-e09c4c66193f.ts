import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Link', (f) => {
  f.node('808530', 'Core.Trigger.Catch', 'Catch', {
    optNodes: { ids: ['903d64', '912259'], type: 'goto', all: false }
  })
    .then('78abeb', 'Core.Browser.RunScript', 'Scrape Followings', {
    func: 'var followers = document.querySelectorAll(`div[aria-label="Timeline: Following"] > div > div`);\nconst results = [];\n\nfor (const follower of followers) {\n  	const profile = {}\n  	if (follower.querySelector("a > div > div > div > span")) {profile.name = follower.querySelector("a > div > div > div > span").textContent.trim()}\n  	if (follower.querySelector("a")) {profile.url = follower.querySelector("a").href.trim()}\n  	var bio = follower.querySelectorAll("div[dir=auto]")[4] || follower.querySelectorAll("div[dir=auto]")[3];\n  	if (bio) {profile.bio = bio.textContent.trim()}\n  	results.push(profile);\n}\n\nreturn results;\n',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });
  f.node('52c568', 'Core.Programming.Function', 'Append Followings', {
    func: 'msg.index += msg.result.length;\nfor(var i = 0; i < msg.result.length;i++){\n  msg.followings.push(msg.result[i])\n}\nif (msg.followings.length > msg.limit){\n  msg.followings = msg.followings.slice(0,msg.limit+1)\n}\nreturn msg;'
  });
  f.node('c16245', 'Core.Programming.Function', 'Create Table', {
    func: 'msg.table = {columns:["bio", "name","url"],rows:[]}\nfor(var i = 0; i < msg.followings.length-1;i++){\n  var bio = msg.followings[i]["bio"] || ""\n  var name = msg.followings[i]["name"] ||  ""\n  var url = msg.followings[i]["url"] || ""\n \n  var temp = {"bio":bio,\n              "name":name,\n              "url":url\n              }\n  msg.table.rows.push(temp)\n}\n\nreturn msg;'
  });
  f.node('b671eb', 'Core.Flow.SubFlow', 'Write To Excel', { subflow: 'bbacfe02-e2e5-4164-a9e2-008b8e96c8cb' })
    .then('d31aed', 'Core.Flow.End', 'End', { sfPort: 0 });
  f.node('d4783e', 'Core.Flow.Begin', 'Begin', {});
  f.node('822499', 'Core.Programming.Function', 'Prepare URL', {
    func: 'msg.account_url = "https://twitter.com/" + msg.twitter_account + "/followings";\nreturn msg;'
  });
  f.node('816089', 'Core.Browser.WaitElement', 'Wait Loading Followings', {
    inPageId: Message('page_id'),
    inSelector: Custom('//div[@aria-label=\'Loading Followers\']'),
    inSelectorType: 'xpath:position',
    optCondition: 'appear-and-disappear',
    optTimeout: Custom('30')
  });
  f.node('698a5c', 'Core.Programming.Function', 'Init', { func: 'msg.followings = [];\nreturn msg;' });
  f.node('d88ae3', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('account_url'),
    outPageId: Message('page_id'),
    optSameTab: true
  });
  f.node('d15558', 'Core.Flow.Label', 'End Of Page', {});
  f.node('912259', 'Core.Programming.Function', 'Append Followers', {
    func: 'msg.index += msg.result.length;\nfor(var i = 0; i < msg.result.length;i++){\n  msg.followings.push(msg.result[i])\n}\nif (msg.followings.length > msg.limit){\n  msg.followings = msg.followings.slice(0,limit+1);\n  throw "Limit Reached";\n}\nreturn msg;'
  })
    .then('889b05', 'Core.Flow.GoTo', 'Go To End Of Page', { optNodes: { ids: ['d15558'], type: 'goto', all: false } });
  f.node('53dd5d', 'Core.Browser.RunScript', 'Scroll Down', {
    func: 'window.scrollBy(0,50000)\nreturn results;\n',
    inPageId: Message('page_id'),
    outResult: Message('result')
  })
    .then('903d64', 'Core.Browser.WaitElement', 'Wait Loading', {
    inPageId: Message('page_id'),
    inSelector: Custom('//div[@role=\'progressbar\']'),
    inSelectorType: 'xpath:position',
    optCondition: 'appear-and-disappear',
    optTimeout: Custom('5')
  })
    .then('49f7a8', 'Core.Browser.RunScript', 'Scrape Followings', {
    func: 'var followers = document.querySelectorAll(`div[aria-label="Timeline: Following"] > div > div`);\nconst results = [];\n\nfor (const follower of followers) {\n  	const profile = {}\n  	if (follower.querySelector("a > div > div > div > span")) {profile.name = follower.querySelector("a > div > div > div > span").textContent.trim()}\n  	if (follower.querySelector("a")) {profile.url = follower.querySelector("a").href.trim()}\n  	var bio = follower.querySelectorAll("div[dir=auto]")[4] || follower.querySelectorAll("div[dir=auto]")[3];\n  	if (bio) {profile.bio = bio.textContent.trim()}\n  	results.push(profile);\n}\n\nreturn results;\n',
    inPageId: Message('page_id'),
    outResult: Message('result')
  });

  f.edge('d15558', 0, '53dd5d', 0);
  f.edge('d88ae3', 0, '698a5c', 0);
  f.edge('816089', 0, '698a5c', 0);
  f.edge('49f7a8', 0, '912259', 0);
  f.edge('c16245', 0, 'b671eb', 0);
  f.edge('78abeb', 0, '52c568', 0);
  f.edge('c16245', 0, '52c568', 0);
  f.edge('816089', 0, '53dd5d', 0);
  f.edge('d4783e', 0, '822499', 0);
  f.edge('d88ae3', 0, '822499', 0);
});
