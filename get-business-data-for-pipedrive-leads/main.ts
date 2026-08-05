import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('ee54780b-96b8-4cac-d345-7f1a9b4c2e86', 'Pipedrive Lead Business Data', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.Pipedrive', '0.1.10');

  f.node('f19b52', 'Core.Flow.Comment', 'About', {
    optText: '### Get Business Data for Pipedrive leads\nEvery 15 minutes, take the leads Pipedrive has touched most recently, turn each one\'s website into a bare domain, look the company up in the Google Business listings database, and write the listing back onto the Pipedrive record.\n\nWhat comes back is the public face of the business: its Google name, description, primary and additional categories, address, star rating and price level. Enough to segment a lead list by industry, size and quality without anyone opening a browser.\n\nA lead whose domain has no Google Business listing is skipped rather than overwritten with blanks.'
  });

  f.node('30ea7d', 'Core.Flow.Comment', 'Poll the CRM', {
    optText: '#### Poll the CRM\nThe ten most recently touched Pipedrive records, every 15 minutes. Records with no website are dropped before the loop.'
  });

  f.node('84c0f6', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('2e51ba', 'Core.Programming.Function', 'Set Parameters', {
      func: `msg.pipedrive_domain = 'your-company';
// Pipedrive exposes custom fields under their 40-character key.
msg.website_field = '3f3a254ef9251532736f4f0dbd65f54929c6090f';
msg.location_name = 'United States';
msg.language_name = 'English';

// Where each enrichment value is written on the Pipedrive side.
// Pipedrive field names - replace these with your own.
msg.field_map = { title: 'df24f0e6eb4ce88df465d09343173a26879c5483', description: '0b2585738d2b789076197cf4ea6458908e1bbbc1', category: '4bf74df4445a524207ad59ac52ecb205fdf2a8d8', additional_categories: '8dffd14911e8f8017dc1e1176b95c172e3181b9b', address: 'f8acb7511aa2ab3fd265b33e6930752b36cad756', rating: '765282dc477ad63fab483288315905094df580c6', price_level: '7fba1a891d202dadf51ab39a4a95a4ce5bd86634' };
return msg;`
    })
    .then('c07b41', 'Robomotion.Pipedrive.GetAll', 'List People', {
      optType: 'person',
      outResult: Message('records'),
      optApiKey: { vaultId: '_', itemId: '_' },
      optDomain: Message('pipedrive_domain')
    })
    .then('7ad493', 'Core.Programming.Function', 'Collect Leads', {
      func: `// Reduce whatever the CRM returned to a flat list of { id, website }.
var leads = [];

var source = msg.records || [];
for (var i = 0; i < source.length; i++) {
  var r = source[i];
  var site = r[msg.website_field] || '';
  if (site) leads.push({ id: r.id, website: site });
}

msg.leads = leads;
msg.lead_count = leads.length;
return msg;`
    });

  f.node('9c6e20', 'Core.Flow.Comment', 'Enrich each lead', {
    optText: '#### Enrich each lead\nOne Business Listings lookup per lead, filtered on the exact domain and limited to the single best match. The DataForSEO node is set to continue on error so one bad domain cannot stop the batch.'
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

msg.dfs_filters = [['domain', '=', msg.domain]];
return msg;`
  });
  f.edge('43f9c1', 0, 'd2807e', 0);

  f.node('ae4108', 'Robomotion.DataForSEO.BusinessData.ListingsSearch', 'Find Business Listing', {
    inFilters: Message('dfs_filters'),
    optLimit: Custom('1'),
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
var listing = (msg.items || [])[0];
if (!listing) return [null, msg];

var extra = listing.additional_categories || [];
msg.enrichment = {
  title: listing.title || '',
  description: listing.description || '',
  category: listing.category || '',
  additional_categories: extra.join(', '),
  address: listing.address || '',
  rating: (listing.rating && listing.rating.value) || '',
  price_level: listing.price_level || ''
};

msg.update_props = {};
for (var key in msg.field_map) {
  if (msg.enrichment[key] !== undefined && msg.field_map[key]) {
    msg.update_props[msg.field_map[key]] = msg.enrichment[key];
  }
}
return [msg, null];`
  });
  f.edge('ae4108', 0, '1f74ab', 0);

  f.node('6b3d09', 'Robomotion.Pipedrive.Update', 'Update Person', {
    optType: 'person',
    inId: Message('lead.id'),
    inData: Message('update_props'),
    optApiKey: { vaultId: '_', itemId: '_' },
    optDomain: Message('pipedrive_domain')
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
