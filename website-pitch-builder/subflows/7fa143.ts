import { subflow, Credential, Custom, Message } from '@robomotion/sdk';

subflow.create('Send The Packet', (f) => {
  f.node('f8192b', 'Core.Flow.Begin', 'Begin', {})
    .then('092a3c', 'Core.Programming.Function', 'Build The Outreach Row', { func: '\nvar w = msg.winner || {};\nvar b = msg.brief || {};\n\nmsg.table = {\n  columns: [\n    \'shop\',\n    \'phone\',\n    \'address\',\n    \'rating\',\n    \'reviews\',\n    \'score\',\n    \'niche\',\n    \'placeholder_site\',\n    \'page\',\n    \'screenshot\',\n    \'prepared_at\'\n  ],\n  rows: [{\n    shop: b.name || w.name || \'\',\n    phone: b.phone || w.phone || \'\',\n    address: b.address || w.address || \'\',\n    rating: b.rating || w.rating || \'\',\n    reviews: b.review_count || w.reviews || \'\',\n    score: w.score || \'\',\n    niche: msg.niche || \'\',\n    placeholder_site: w.placeholder_site || \'\',\n    page: msg.page_path || \'\',\n    screenshot: msg.screenshot_path || \'\',\n    prepared_at: new Date().toISOString()\n  }]\n};\n\nmsg.attachments = [msg.screenshot_path, msg.csv_path];\n\nmsg.mail_subject = \'Website pitch ready: \' + (b.name || w.name || \'a shop\');\n\nvar body = [];\nbody.push((b.name || w.name || \'This shop\') + \' has no website of its own.\');\nbody.push(\'\');\nbody.push(\'Phone:   \' + (b.phone || w.phone || \'\'));\nbody.push(\'Address: \' + (b.address || w.address || \'\'));\nbody.push(\'Rating:  \' + (b.rating || w.rating || \'\') + \' from \' + (b.review_count || w.reviews || \'\') + \' reviews\');\nbody.push(\'Listed:  \' + (w.placeholder_site || \'(no site at all)\'));\nbody.push(\'\');\nbody.push(\'The page is built and waiting at:\');\nbody.push(\'  \' + (msg.page_path || \'\'));\nbody.push(\'\');\nbody.push(\'Attached: a screenshot of the page as it renders, and the outreach row as CSV.\');\n\nmsg.mail_body = body.join(String.fromCharCode(10));\nreturn msg;\n' })
    .then('1a3b4d', 'Core.CSV.WriteCSV', 'Write The Outreach CSV', { inFilePath: Message('csv_path'), optHeaders: true })
    .then('2b4c5e', 'Core.Mail.Connect', 'Connect To The Mailbox', { optCredentials: Credential({ vaultId: '_', itemId: '_' }) })
    .then('3c5d6f', 'Core.Mail.Send', 'Mail The Packet', {
    inFrom: Custom('robot@example.com'),
    inTo: Custom('you@example.com'),
    inSubject: Message('mail_subject'),
    inBody: Message('mail_body'),
    optSecurity: 'none'
  })
    .then('4d6e70', 'Core.Mail.Disconnect', 'Disconnect', {})
    .then('5e7f81', 'Core.Flow.End', 'Packet Sent', { sfPort: 0 });
});