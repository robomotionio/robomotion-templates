# RemoteOK Job Details

RemoteOK is one of the internet's most-visited dedicated remote job boards, attracting candidates specifically searching for fully distributed work. Unlike general job boards that mix remote and in-office roles, every listing on RemoteOK is remote by definition - making it a focused signal of how companies are staffing distributed teams. Individual job posting pages on RemoteOK display the job title, hiring company, company link, salary range (when provided), a list of skill and technology tags, geographic location restrictions (worldwide, Americas-only, Europe-only, etc.), the full job description, company logo, view count, and application count.

## What it extracts

- **Job Title** — Position title as listed by the employer.
- **Company Name** — Hiring organisation name.
- **Company Link** — Direct URL to the company's RemoteOK profile or website.
- **Location** — Geographic eligibility (worldwide, Americas, Europe, specific country, etc.).
- **Salary** — Stated minimum and maximum compensation (where disclosed).
- **Logo** — Company logo image displayed on the job posting.
- **Tags** — Technology and skill labels attached to the posting.
- **Description** — Full text of the role description and requirements.
- **Views** — Number of times the job listing has been viewed.
- **Applied** — Number of candidates who have applied to the posting.

## What you can do with it

- Remote salary market intelligence: RemoteOK postings frequently include explicit salary ranges - more consistently than many traditional job boards. Extract salary data across engineering, design, and marketing roles to build a remote-specific compensation benchmark.
- Skill demand tracking for distributed roles: The tag system on RemoteOK (React, Python, Customer Support, etc.) explicitly labels what skills each role requires. Extract tags across postings to quantify which technologies and competencies remote employers value most.
- Location restriction mapping: Not all remote jobs are truly global. Extract the geographic restriction field to understand which companies hire worldwide versus restricting to specific time zones or regions - critical intelligence for distributed HR teams and candidates in constrained geographies.
- Company remote hiring activity: Extract postings by company to track which organisations are actively scaling their remote workforce. Companies posting frequently on RemoteOK signal strong distributed hiring intent.

## How it works

Just run the flow. It loads the source, extracts the fields listed above, and saves them as a CSV in your home folder.

## Frequently asked questions

**Do all RemoteOK postings include a salary range?**

No. Salary disclosure is voluntary. Many companies include a range, but some postings omit salary data. The robot extracts the range when present and leaves the field blank when absent.

**What do location restrictions like 'Americas only' mean in practice?**

Companies set these to indicate the time zones or regions where candidates must be based. 'Americas only' typically means UTC-8 to UTC-3 time zones. 'Worldwide' means no restrictions. The robot extracts the exact restriction text as stated by the employer.

**Can I monitor a specific company's RemoteOK postings?**

Yes. Navigate to a company's RemoteOK profile page and extract from there, or extract individual posting URLs as you discover them through search. The robot captures the company link for easy reference.
