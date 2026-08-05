import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('2c98bc4f-dafc-4a0a-b789-bd5edf806c2a', 'GoHighLevel Lead Traffic Stats', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.GoHighLevel', '1.1.0');

  f.node('f19b52', 'Core.Flow.Comment', 'About', {
    optText: '### Get Traffic Stats for GoHighLevel leads\nEvery 15 minutes, take the leads GoHighLevel has touched most recently, turn each one\'s website into a bare domain, estimate how much organic search traffic that domain gets, and write the numbers back onto the GoHighLevel record.\n\nEstimated traffic value (ETV) is the single most useful qualifying number you can attach to an inbound lead: it separates the agency with 200 visits a month from the one with 200,000, before anyone picks up the phone.\n\nA lead whose domain returns no estimate is skipped rather than overwritten with zeros.'
  });

  f.node('30ea7d', 'Core.Flow.Comment', 'Poll the CRM', {
    optText: '#### Poll the CRM\nThe ten most recently touched GoHighLevel records, every 15 minutes. Records with no website are dropped before the loop.'
  });

  f.node('84c0f6', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('2e51ba', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.location_id = 'REPLACE_WITH_LOCATION_ID';
msg.location_name = 'United States';
msg.language_name = 'English';

// Where each enrichment value is written on the GoHighLevel side.
// GoHighLevel field names - replace these with your own.
msg.field_map = { etv: 'REPLACE_WITH_ETV_CUSTOM_FIELD_ID', organic_keywords: '', organic_traffic_cost: '', paid_etv: '' };
return msg;`
    })
    .then('a3018f', 'Core.Vault.GetItem', 'Read API Token', {
      optCredentials: { vaultId: '_', itemId: '_' },
      outItem: Message('credentials')
    })
    .then('6d24c7', 'Core.Programming.Function', 'Build Request Headers', {
      func: `// The vault item holds the GoHighLevel private integration token.
msg.req_headers = {
  Authorization: 'Bearer ' + msg.credentials.password,
  Version: '2021-07-28',
  'Content-Type': 'application/json'
};
return msg;`
    })
    .then('c07b41', 'Robomotion.GoHighLevel.Contacts.Search', 'List Recent Contacts', {
      inLocationID: Message('location_id'),
      optLimit: Custom('10'),
      optSortBy: 'date_updated',
      optOrder: 'desc',
      outContacts: Message('contacts'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('7ad493', 'Core.Programming.Function', 'Collect Leads', {
      func: `// Reduce whatever the CRM returned to a flat list of { id, website }.
var leads = [];

var source = msg.contacts || [];
for (var i = 0; i < source.length; i++) {
  var c = source[i];
  var site = c.website || '';
  if (site) leads.push({ id: c.id, website: site });
}

msg.leads = leads;
msg.lead_count = leads.length;
return msg;`
    });

  f.node('9c6e20', 'Core.Flow.Comment', 'Enrich each lead', {
    optText: '#### Enrich each lead\nOne Bulk Traffic Estimation call per lead. The endpoint accepts up to 1000 targets at once, so if you are enriching a large backlog it is worth batching the domains rather than looping - see the bulk backlink templates in this set for that shape.'
  });

  // Label is a jump target only - it has no input port, so the first pass enters
  // the loop through the ForEach and the GoTo comes back through the Label.
  f.node('b5d817', 'Core.Flow.Label', 'Next Lead', {});

  f.node('43f9c1', 'Core.Programming.ForEach', 'For Each Lead', {
    optInput: Message('leads'),
    optOutput: Message('lead'),
    optIndex: Message('lead_index')
  });
  f.edge('7ad493', 0, '43f9c1', 0);
  f.edge('b5d817', 0, '43f9c1', 0);

  f.node('d2807e', 'Core.Programming.Function', 'Normalise Domain', {
    func: `// DataForSEO matches on a bare domain, so drop the scheme, any www prefix and
// everything from the first slash on: https://www.acme.com/pricing -> acme.com
var site = (msg.lead.website || '').toString().trim();
msg.domain = site
  .replace(/^https?:\\/\\//i, '')
  .replace(/^www\\./i, '')
  .split('/')[0]
  .split('?')[0]
  .toLowerCase();

msg.dfs_task = {
  targets: [msg.domain],
  location_name: msg.location_name,
  language_name: msg.language_name
};
return msg;`
  });
  f.edge('43f9c1', 0, 'd2807e', 0);

  f.node('ae4108', 'Robomotion.DataForSEO.Account.RawRequest', 'Estimate Organic Traffic', {
    inPath: Custom('/dataforseo_labs/google/bulk_traffic_estimation/live'),
    inBody: Message('dfs_task'),
    optMethod: 'POST',
    optTimeout: Custom('120'),
    outItems: Message('items'),
    outCost: Message('cost'),
    optCredentials: { vaultId: '_', itemId: '_' },
    continueOnError: true
  });
  f.edge('d2807e', 0, 'ae4108', 0);

  f.node('1f74ab', 'Core.Programming.Function', 'Map Enrichment', {
    outputs: 2,
    func: `// Port 0: we have something to write back. Port 1: nothing found for this
// domain - skip the update and move on to the next lead.
var estimate = (msg.items || [])[0];
if (!estimate) return [null, msg];

var organic = (estimate.metrics && estimate.metrics.organic) || {};
var paid = (estimate.metrics && estimate.metrics.paid) || {};
msg.enrichment = {
  etv: organic.etv || 0,
  organic_keywords: organic.count || 0,
  organic_traffic_cost: organic.estimated_paid_traffic_cost || 0,
  paid_etv: paid.etv || 0
};

var custom = [];
for (var key in msg.field_map) {
  if (msg.enrichment[key] !== undefined && msg.field_map[key]) {
    custom.push({ id: msg.field_map[key], value: String(msg.enrichment[key]) });
  }
}
msg.update_props = { customFields: custom };
msg.update_url = 'https://services.leadconnectorhq.com/contacts/' + msg.lead.id;
return [msg, null];`
  });
  f.edge('ae4108', 0, '1f74ab', 0);

  f.node('6b3d09', 'Core.Net.HttpRequest', 'Update Contact', {
    optMethod: 'put',
    optUrl: Message('update_url'),
    inHeaders: Message('req_headers'),
    inBody: Message('update_props'),
    outBody: Message('crm_response'),
    outStatus: Message('crm_status')
  });
  f.edge('1f74ab', 0, '6b3d09', 0);

  f.node('c81402', 'Core.Flow.GoTo', 'Next', {
    optNodes: { ids: ['b5d817'], type: 'goto', all: false }
  });
  f.edge('6b3d09', 0, 'c81402', 0);
  f.edge('1f74ab', 1, 'c81402', 0);

  f.node('50b9de', 'Core.Flow.Stop', 'Stop', {});
  f.edge('43f9c1', 1, '50b9de', 0);
}).start();
