import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('cc3256e9-74f6-4a8a-b123-5d9e7f2a0c64', 'Hubspot Lead Business Data', (f) => {
  f.addDependency('Robomotion.DataForSEO', '1.0.0');
  f.addDependency('Robomotion.HubSpot', '1.1.0');

  f.node('f19b52', 'Core.Flow.Comment', 'About', {
    optText: '### Get Business Data for Hubspot leads\nEvery 15 minutes, take the leads Hubspot has touched most recently, turn each one\'s website into a bare domain, look the company up in the Google Business listings database, and write the listing back onto the Hubspot record.\n\nWhat comes back is the public face of the business: its Google name, description, primary and additional categories, address, star rating and price level. Enough to segment a lead list by industry, size and quality without anyone opening a browser.\n\nA lead whose domain has no Google Business listing is skipped rather than overwritten with blanks.'
  });

  f.node('30ea7d', 'Core.Flow.Comment', 'Poll the CRM', {
    optText: '#### Poll the CRM\nThe ten most recently touched Hubspot records, every 15 minutes. Records with no website are dropped before the loop.'
  });

  f.node('84c0f6', 'Core.Trigger.Inject', 'Every 15 Minutes', {
    optOnce: false,
    optRepeat: 900,
    optOnceDelay: 5
  })
    .then('2e51ba', 'Core.Programming.Function', 'Set Parameters', {
      func: `// The website is read from the standard HubSpot website contact property.
msg.location_name = 'United States';
msg.language_name = 'English';

// Where each enrichment value is written on the Hubspot side.
// Hubspot field names - replace these with your own.
msg.field_map = { title: 'bd_title', description: 'bd_description', category: 'bd_main_category', additional_categories: 'bd_additional_categories', address: 'bd_address', rating: 'bd_rating_on_google', price_level: 'bd_price_level' };
return msg;`
    })
    .then('c07b41', 'Robomotion.HubSpot.Contacts.List', 'List Recent Contacts', {
      inProperties: Custom('website'),
      optLimit: Custom('10'),
      outContacts: Message('contacts'),
      optCredentials: { vaultId: '_', itemId: '_' }
    })
    .then('7ad493', 'Core.Programming.Function', 'Collect Leads', {
      func: `// Reduce whatever the CRM returned to a flat list of { id, website }.
var leads = [];

var source = msg.contacts || [];
for (var i = 0; i < source.length; i++) {
  var c = source[i];
  var site = (c.properties && c.properties.website) || '';
  if (site) leads.push({ id: c.id, website: site });
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

  f.node('6b3d09', 'Robomotion.HubSpot.Contacts.Update', 'Update Contact', {
    inContactID: Message('lead.id'),
    inProperties: Message('update_props'),
    optCredentials: { vaultId: '_', itemId: '_' }
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
