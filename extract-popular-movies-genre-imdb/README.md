# IMDb Popular Movies by Genre

IMDb is the definitive database for film and television, cataloging over 10 million titles with ratings from more than 200 million registered users. Its genre-based popularity rankings surface the films audiences actually watch and rate - not just the ones critics review. For entertainment industry analysts studying genre trends, content creators researching audience preferences, and developers building recommendation engines, IMDb's genre pages are the richest public source of structured movie data.

## What it extracts

- **Position** — Ranking position on the IMDb genre page.
- **Title** — Full title of the film.
- **Year** — Year of theatrical release.
- **Duration** — Film runtime in minutes.
- **Rating** — Average user rating out of 10.
- **Votes** — Total number of user ratings submitted.
- **Metascore** — Critic score from Metacritic (0-100).
- **Description** — Plot summary or brief description of the film.
- **Poster** — Movie poster image thumbnail.
- **IMDb Link** — Direct URL to the film's IMDb page.

## What you can do with it

- Genre performance benchmarking: See how movies in a specific genre perform. Compare average ratings, vote counts, and runtimes to understand what audiences expect from each genre.
- Talent tracking: Extract director and cast data to map which filmmakers dominate specific genres. Identify directors whose genre films consistently outperform.
- Release pattern analysis: Study which months and years produce the highest-rated films in a genre. Seasonal release patterns differ dramatically between action blockbusters and indie dramas.
- Audience scale measurement: Vote counts on IMDb indicate audience reach. A film with 500K votes has fundamentally different market penetration than one with 5K votes, even at the same rating.

## How it works

Just run the flow. It loads the source, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**Can I extract from multiple genres?**

Run separate extractions for each genre page URL. Each extraction captures one genre's popular movies.

**Does it include box office data?**

IMDb genre listing pages typically show ratings, votes, metascores, and basic metadata. Box office figures are available on individual movie pages.

**Can I extract TV shows too?**

IMDb has separate pages for TV shows. Navigate to a TV genre page and the robot extracts whatever data is displayed.

**How are the movies ranked?**

IMDb's 'popular' rankings use a combination of user ratings, vote counts, and recency. The exact algorithm is proprietary to IMDb.

**Is this IMDb scraper free?**

Browse AI's free plan includes credits to run this robot. No credit card required.
