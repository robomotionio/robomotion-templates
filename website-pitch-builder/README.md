# Website Pitch Builder

There is a whole genre of video about this. Search Google Maps for a trade, find the shops with no website, have a coding agent build one, send the owner a screenshot, charge about a thousand dollars. This template is that machine, built on a canvas, with the part those videos leave out left in.

It searches Google Maps through the **scrape.do** API, keeps only the listings that have a phone number, enough reviews to prove the shop has customers, and no real website of their own, and scores what is left. It then gathers everything the map knows about the winner — the full week of opening hours, the ten highest-rated reviews word for word, and four public domain photographs — and hands that brief to a **DeepSeek Agent** with one directory it is allowed to write to. The agent writes a single self-contained HTML file. A real browser opens it, photographs it, and the screenshot goes out by mail with a CSV row.

Five subflows, so the main canvas reads as a sentence: find the lead, gather the material, build the site, shoot the page, send the packet.

## What Website Pitch Builder can do

- Search Google Maps for any trade in any city, through an API that needs no browser
- Tell a real website from a placeholder — a Facebook page, a Wix subdomain, a `business.site` or a Yelp listing all count as *no site*
- Score the qualifying shops and pick one, rather than dumping a list on you
- Read a place's opening hours and its best reviews, then write a page whose every claim traces back to them
- Find photographs that are actually free to use, and credit them with the licence string the API returned
- Photograph the finished page the way a person would see it, and mail you the picture

## Behind the scenes

**Find The Lead** is where the whole run is decided. One Function node carries two lines — the niche and the review floor — and everything downstream follows from them. The scrape.do token comes out of a Vault item and is assembled into the request URL by a Function, because the Maps API takes its token as a query parameter and has no header form: the key is never typed into a node property, so it cannot be read off one either.

*Pick Best Prospect* is the interesting node. "No website" is not one condition. A listing that points at a Facebook page, a Wix subdomain or a Google mini site has exactly the same gap as one with nothing at all, so the test is a host list, not a null check. A shop also has to have a phone (it is the only channel that exists) and at least `min_reviews` reviews, and what survives is scored `rating × log₁₀(reviews + 1)` — which prefers a 4.6 with two hundred reviews over a 5.0 with three. The node has two outputs: a winner, or nothing, and *nothing* is a normal outcome for a niche that was a bad idea.

**Gather The Material** calls the Maps *place* and *reviews* endpoints for the winner, then searches Openverse for photographs with `license=cc0`. It takes the first four results in the order the API returns them and copies each one's `license` string verbatim into the brief, because a licence is data, not prose.

**Build The Site** writes the prompt and hands it over. The agent gets the brief as JSON and a hard set of rules: invent nothing, no prices, no founding date, no email address, quote the four reviews word for word, use all four photographs in the order given, one file, all CSS inline, under 10 KB. It has one directory it may write to and one tool it needs.

**Shoot The Page** sets a 1280×1000 window, opens the file the agent wrote, waits eight seconds for the remote photographs to arrive, and screenshots it.

**Send The Packet** builds a CSV row — shop, phone, address, rating, reviews, score, niche, the placeholder site it was listed with, and where the page and the screenshot are — writes it to disk, and mails both files to you.

**Google Maps has no email column.** Not on the search, not on the place, not on the reviews. A shop with no website usually has no work email either, which is the step nobody in that genre of video mentions. So the packet does not go to the shop. It comes to you, with the phone number in it, and a person decides whether that call is worth making. The robot does not find you a customer — it finds you the ten minutes before the phone call.

## Setup Guide

1. **A scrape.do token.** Sign up at [scrape.do](https://scrape.do) and put the token into a Vault item of type *API Key*. Select it in **both** *Get Scrape.do Token* nodes — one inside **Find The Lead**, one inside **Gather The Material**.
2. **An OpenRouter key.** Put it into a Vault item of type *API Key* and select it in the *Write The Page* agent's **API Key** property. The **Custom Model** is already set to `deepseek/deepseek-v4-pro-0813`; **Base URL** is OpenRouter's.
3. **A folder for the pages.** The template writes into `/home/robot/PitchSites`, named in two places: the agent's **Workspace** property and the *Locate The Page* Function beside it. Change both to a directory that exists on your robot.
4. **A mailbox.** Put your SMTP host, port, username and password into a Vault item of type *Email*, select it in *Connect To The Mailbox*, and set **From** and **To** on *Mail The Packet*.
5. **A robot with a desktop**, because *Shoot The Page* opens a real browser:

   ```bash
   robomotion-deskbot connect -i <email> -w <workspace> -r <robot>
   ```

6. **Pick your niche** in *Niche & Minimum Reviews* inside **Find The Lead**:

   ```js
   msg.niche = 'shoe repair Los Angeles';
   msg.min_reviews = 20;
   ```

   Then change `msg.photo_query` in *Shape The Facts* to match — a page about a cobbler wants pictures of leather shoes, not of whatever the last niche was.

7. **Run it.** The Dev Console shows the winner as soon as *Find The Lead* returns, and the page lands in the folder about a minute later.

## Customization

**Change the trade and the city** in one line. That is the only edit most runs need, and it is the line worth thinking hardest about: the niche decides whether twenty listings yield one lead or none.

**Loosen or tighten the filter** in *Pick Best Prospect*. `placeholderHosts` is the list of things that do not count as a website — add a regional site builder or a directory that is common where you are searching. `min_reviews` is the proof-of-customers floor.

**Change the scoring** on the same node. `rating × log₁₀(reviews + 1)` balances quality against evidence; a plain `reviews` sort chases the busiest shop instead.

**Rewrite the brief** in *Write The Brief* to change what gets built. The prompt is ordinary JavaScript building an array of lines, so the rules are readable and editable — the sections are where the page goes, what goes on it, what must not appear, how it should look, and the size limit.

**Swap the model** on the agent node. Anything OpenRouter serves will do; the flow does not care which one wrote the file.

**Do more than one shop** by looping *Pick Best Prospect* over the qualifying list instead of returning the best. Everything downstream already works one lead at a time.

**Send it somewhere else.** The mail nodes are the last three in **Send The Packet** — replace them with a Google Sheets append, a Slack message, or a CRM call, and the CSV row is already shaped for it.

## Requirements

- **Robomotion.DeepSeekAgent** 0.7.5
- A **robot with a desktop session**, since a real browser opens on it to photograph the page
- A **scrape.do** account for the Google Maps API, and an **OpenRouter** key for the agent
- An **SMTP mailbox** the robot can send through
- Outbound network access from the robot to scrape.do, Openverse, OpenRouter and the photograph hosts
