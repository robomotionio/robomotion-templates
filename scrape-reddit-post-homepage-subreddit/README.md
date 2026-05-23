# Reddit Homepage & Subreddit Post Scraper

Reddit's homepage and its 2.8 million subreddits are among the most powerful real-time windows into what communities care about right now. The homepage aggregates the most upvoted posts from across Reddit's most popular communities, while individual subreddits surface the posts resonating most with specific audiences - from software developers to real estate investors to true crime enthusiasts. Each post displays a position number, a direct link, the title, the author's username, the upvote score, the number of comments, any attached images, and the time since posting.

## What it extracts

- **Position** — The numerical position of the post on the page.
- **Link** — Direct URL link to the full post and comments.
- **Title** — Full title of the Reddit post.
- **Posted by** — Reddit username of the post creator.
- **Total Comments** — Number of comments on the post.
- **Total Votes** — Net upvote count (upvotes minus downvotes).
- **Time Posted** — Time elapsed since the post was submitted.
- **Image URL** — URL of the image attached to the post, if present.

## What you can do with it

- Real audience intelligence: Reddit posts are written by real people about what they actually care about. Extract subreddit posts to discover genuine audience interests, pain points, and trending topics that no survey or focus group could surface.
- Content strategy grounding: High-upvote post titles are proven to resonate with a specific audience. Extract to identify the exact language, framing, and topics that earn community engagement for your content planning.
- Brand and product monitoring: Extract posts from subreddits where your customers congregate. Track mentions of your product, competitor discussions, and feature requests emerging organically in community conversations.
- Trend detection: Extracting subreddit posts over time reveals what's rising and what's fading in community attention. Catch emerging trends before they hit mainstream media or industry publications.

## How it works

Enter the requested input when prompted. The flow opens the target page, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**How is this different from the Reddit search scraper?**

The Reddit search scraper (page 224) extracts posts returned by a specific search query. This robot extracts the posts visible when browsing the homepage or a subreddit directly - surfacing what's trending organically rather than matching a keyword search.

**Can I extract by sort type - Hot, New, Top, Rising?**

Yes. Set the sort order on Reddit before copying the URL. The robot extracts posts in whatever sort order the page displays, so switching to Top (Week) or Rising gives you different post sets.

**Can I extract from private or NSFW subreddits?**

The robot extracts only publicly accessible Reddit pages. Private subreddits require membership, and NSFW communities may require age verification. The robot works with any publicly viewable page.
