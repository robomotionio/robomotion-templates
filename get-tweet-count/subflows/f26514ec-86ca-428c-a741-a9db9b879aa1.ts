import { subflow, Custom, Message } from '@robomotion/sdk';

subflow.create('Open Link', (f) => {
  f.node('b20c07', 'Core.Trigger.Catch', 'Catch', {
    optNodes: { ids: ['7464c5', '9da26c', 'be64de', '0c2c37', 'df42a3', '0e3a09', '5090bc'], type: 'goto', all: false }
  })
    .then('abddf5', 'Core.Programming.Function', 'Handle Error', {
    func: 'msg.table.rows[msg.account_counter]["tweet_count"] = "error occured";\nmsg.account_counter++;\nreturn msg;'
  });
  f.node('407966', 'Core.Flow.Begin', 'Begin', {});
  f.node('176a35', 'Core.Programming.Function', 'Save Tweet Count', {
    func: 'msg.table.rows[msg.account_counter]["tweet_count"] = msg.tweet_count;\nmsg.account_counter++;\nreturn msg;'
  });
  f.node('df42a3', 'Core.Programming.Function', 'Init', { func: 'msg.tweets = [];\n\nreturn msg;' })
    .then('0e3a09', 'Core.Browser.WaitElement', 'Wait Loading', {
    inPageId: Message('page_id'),
    inSelector: Custom('//div[contains(@aria-label, \'Loading Tweets by\')]'),
    inSelectorType: 'xpath:position',
    optCondition: 'appear-and-disappear',
    optTimeout: Custom('30')
  })
    .then('5090bc', 'Core.Browser.RunScript', 'Scrape Tweet Count', {
    func: 'function getTweetCount() {\n  var path = "//div[@aria-label=\'Back\']"\n  var back_button = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;\n  var tweet_count = back_button.parentElement.nextSibling.children[0].children[1].textContent\n  return tweet_count\n}\n\nreturn getTweetCount();',
    inPageId: Message('page_id'),
    outResult: Message('tweet_count')
  });
  f.node('0c2c37', 'Core.Browser.OpenLink', 'Open Link', {
    inBrowserId: Message('browser_id'),
    inPageId: Message('page_id'),
    inUrl: Message('account_url'),
    outPageId: Message('page_id'),
    optSameTab: true
  });
  f.node('be64de', 'Core.Programming.Function', 'Prepare URL', {
    func: 'var twitter_account = msg.row["account_name"];\nmsg.account_url = "https://twitter.com/" + twitter_account;\nreturn msg;'
  });
  f.node('439e1e', 'Core.Flow.End', 'End', { sfPort: 0 });

  f.edge('0c2c37', 0, 'df42a3', 0);
  f.edge('407966', 0, 'be64de', 0);
  f.edge('0c2c37', 0, 'be64de', 0);
  f.edge('5090bc', 0, '176a35', 0);
  f.edge('176a35', 0, '439e1e', 0);
  f.edge('abddf5', 0, '439e1e', 0);
});
