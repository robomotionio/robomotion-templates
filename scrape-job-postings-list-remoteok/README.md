# RemoteOK Job Listings

RemoteOK is one of the highest-traffic job boards focused exclusively on remote positions, attracting listings from technology-forward companies, remote-first startups, and distributed teams across every time zone. Unlike traditional job boards where remote roles are mixed in with office positions, every listing on RemoteOK is explicitly remote - making it the go-to source for studying the distributed work economy. Each listing in RemoteOK's search results shows the position number in the results, the job title, the company name, a salary range (RemoteOK actively encourages employers to post pay), relevant tech and skill tags (such as Python, React, marketing, design), geographic restrictions on where candidates must be based, the company logo, and the posting recency.

## What it extracts

- **Position** — Sequential position number in the extracted list.
- **Job Title** — Title of the remote position.
- **Company Name** — Hiring organization.
- **Location** — Geographic restrictions or remote work region, if any.
- **Salary** — Advertised pay range, where posted.
- **Time** — Listing recency (hours or days ago).
- **Tags** — Tech stack, skill, and category labels.
- **Job Link** — Direct link to the full listing on RemoteOK.
- **Logo** — Company logo image from the job listing.

## What you can do with it

- Remote salary transparency: RemoteOK posts salary ranges more consistently than most job boards. Extract listings to build accurate compensation benchmarks for remote roles without relying on self-reported survey data.
- Skill demand mapping: Every RemoteOK listing carries tech and skill tags. Extract hundreds of listings to count tag frequency and understand exactly which skills remote employers are prioritizing right now.
- Hiring competition awareness: Know who else is recruiting remote talent in your role category. Extract listings to see which companies are competing for the same candidates so you can sharpen your employer value proposition.
- Geographic restriction analysis: Many remote roles restrict candidates to specific countries or time zones. Extract listings to understand how geographically open the remote job market actually is for different roles and skill sets.

## How it works

Just run the flow. It loads the source, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**Does RemoteOK always include salary?**

RemoteOK strongly encourages employers to list salary but it is not mandatory. Listings with salary data are common but not universal - the robot extracts salary where it appears.

**What makes this different from the RemoteOK single job detail robot?**

This robot extracts the summary data from a list of jobs on a search or category page - many jobs at once. A detail-page robot would extract the full description of a single posting. Use this one for market-wide data collection.

**Can I filter by specific tags like 'Python' or 'Marketing'?**

Yes. RemoteOK's tag-based browsing system creates distinct URLs per tag or combination. Browse to the tag category you want, copy that URL, and the robot will extract only listings with that tag.
