#!/usr/bin/env python3
"""Regenerate academy.yaml from the Robomotion Academy YouTube playlist.

The Flow Designer's Home page renders the Academy section straight from
academy.yaml in this repo. It cannot read YouTube itself: neither the playlist
page nor the playlist RSS feed sends CORS headers, so a browser fetch is
blocked. This script is the bridge - run it whenever a video is added to the
playlist, then commit the regenerated academy.yaml.

    python3 tools/build-academy-yaml.py            # rewrite academy.yaml
    python3 tools/build-academy-yaml.py --stdout   # print, don't write

Two sources are combined:
  * the playlist page  - canonical order, titles and runtimes
  * each video's watch page - publish date and the opening line of the description

It used to read the second from the playlist RSS feed. That feed is gone: both
https://www.youtube.com/feeds/videos.xml?playlist_id=... and the channel_id form
answer 404 as of 2026-08-28, so a regeneration died on an HTTPError before it
wrote anything. The watch page carries the same two fields in
ytInitialPlayerResponse, and reproduces every value the feed used to give,
provided the timestamp is normalised to UTC first - YouTube serves it with a
-07:00 offset, and taking the date off that shifts half the series back a day.

The cost is one request per video instead of one for the playlist. At a dozen
videos that is fine; if the series grows past a few dozen, cache them.

Only stdlib is used, so there is nothing to install.

Curation (level + topic) lives in CURATION below rather than in the YAML,
so a regeneration can never silently drop it. A video that reaches the
playlist without a CURATION entry still lands in the file; the script prints a
warning naming it so the gap gets filled.
"""

import argparse
import datetime
import json
import re
import sys
import urllib.request

PLAYLIST_ID = "PLie2idTJ_1wvlEgLuDUDt_bbAs-29xtmL"
PLAYLIST_URL = f"https://www.youtube.com/playlist?list={PLAYLIST_ID}"

# Shown above the video row in the designer. Kept here (not scraped) because the
# YouTube playlist blurb is written for YouTube's audience, not for the product.
SERIES_TITLE = "Robomotion Academy"
SERIES_DESCRIPTION = (
    "Short lessons that take you from your first flow to production "
    "automations, one node and one idea at a time."
)

# Hand-curated per video. Regenerating never overwrites these.
#   level: Beginner | Intermediate | Advanced  (matches docs/level-field.md)
#   topic: the short track label shown on the card
CURATION = {
    "F-Gi97ODx2s": ("Beginner", "Getting Started"),
    "aNLQIXtkyqU": ("Beginner", "Core Nodes"),
    "emCSlgmyEL4": ("Beginner", "Scripting"),
    "YaJEw729Vkk": ("Beginner", "Branching"),
    "QhzterofTC4": ("Beginner", "Iteration"),
    "vaj_pqvyfJA": ("Intermediate", "Security"),
    "J_BaSeHnmhU": ("Intermediate", "Error Handling"),
    "CFNHmF-DbPw": ("Intermediate", "Web Scraping"),
    "bxAkfUO8P-Y": ("Advanced", "Web Scraping"),
    "qtKmRoyMKZo": ("Intermediate", "Scripting"),
    "00BweGh8ISo": ("Intermediate", "Orchestration"),
    "8FUPGnAYWA0": ("Advanced", "Retrieval"),
    "hM8DaZ0MkhU": ("Intermediate", "Forms"),
    "YnBsUuHYnRc": ("Advanced", "Assistants"),
}

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"


def get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", "replace")


def walk(node, key, out):
    """Collect every value stored under `key` anywhere in a nested structure."""
    if isinstance(node, dict):
        if key in node:
            out.append(node[key])
        for value in node.values():
            walk(value, key, out)
    elif isinstance(node, list):
        for value in node:
            walk(value, key, out)


def parse_duration(text: str) -> int:
    """"6:35" / "1:02:11" -> seconds. Returns 0 on anything unexpected."""
    parts = text.strip().split(":")
    if not all(p.isdigit() for p in parts):
        return 0
    seconds = 0
    for part in parts:
        seconds = seconds * 60 + int(part)
    return seconds


def fetch_playlist_items():
    """Playlist order, video ids, titles and runtimes, from the playlist page."""
    html = get(PLAYLIST_URL)
    match = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
    if not match:
        sys.exit("could not find ytInitialData - YouTube changed its page shape")

    lockups = []
    walk(json.loads(match.group(1)), "lockupViewModel", lockups)

    items = []
    seen = set()
    for lockup in lockups:
        video_id = lockup.get("contentId")
        if not video_id or video_id in seen:
            continue

        titles = []
        walk(lockup.get("metadata", {}), "content", titles)
        title = next((t for t in titles if isinstance(t, str) and t.strip()), "")

        badges = []
        walk(lockup.get("contentImage", {}), "thumbnailBadgeViewModel", badges)
        duration = next(
            (b.get("text", "") for b in badges if parse_duration(b.get("text", ""))), ""
        )

        if not title:
            continue
        seen.add(video_id)
        items.append({"id": video_id, "title": title, "duration": duration})

    if not items:
        sys.exit("playlist page yielded no videos - YouTube changed its page shape")
    return items


def video_details(video_id: str):
    """Publish date (UTC) + first description paragraph, from the video's watch page."""
    html = get(f"https://www.youtube.com/watch?v={video_id}")
    match = re.search(r"var ytInitialPlayerResponse = (\{.*?\});", html, re.S)
    if not match:
        return {"published": "", "summary": ""}
    data = json.loads(match.group(1))

    description = data.get("videoDetails", {}).get("shortDescription", "") or ""
    summary = description.strip().split("\n\n")[0].strip().replace("\n", " ")

    # "2026-08-20T23:23:04-07:00" is the same instant the RSS feed reported as
    # 2026-08-21. Take the date off the local-offset string and half the series
    # moves back a day, so convert first.
    stamp = (data.get("microformat", {})
                 .get("playerMicroformatRenderer", {})
                 .get("publishDate", "") or "")
    published = ""
    if stamp:
        try:
            published = (datetime.datetime.fromisoformat(stamp)
                         .astimezone(datetime.timezone.utc).date().isoformat())
        except ValueError:
            published = stamp[:10]
    return {"published": published, "summary": summary}


def wrap(text: str, indent: str, width: int = 88):
    """Fold a long value into YAML block-scalar lines."""
    words, lines, line = text.split(), [], ""
    for word in words:
        if line and len(indent) + len(line) + 1 + len(word) > width:
            lines.append(indent + line)
            line = word
        else:
            line = f"{line} {word}".strip()
    if line:
        lines.append(indent + line)
    return lines


def render(videos) -> str:
    out = [
        "# Robomotion Academy - the video series rendered on the Flow Designer Home page.",
        "#",
        "# GENERATED FILE. Regenerate with:  python3 tools/build-academy-yaml.py",
        "# Edit CURATION in that script (not this file) to change a level or topic;",
        "# every other field is read from the playlist and will be overwritten.",
        "schema_version: 1",
        f"playlist_id: {PLAYLIST_ID}",
        f"playlist_url: {PLAYLIST_URL}",
        f"title: {SERIES_TITLE}",
        "description: >-",
    ]
    out += wrap(SERIES_DESCRIPTION, "  ")
    out.append("videos:")

    for index, video in enumerate(videos, start=1):
        out.append(f"  - id: {video['id']}")
        out.append(f"    episode: {index}")
        out.append(f"    title: {json.dumps(video['title'])}")
        if video["summary"]:
            out.append("    summary: >-")
            out += wrap(video["summary"], "      ")
        out.append(f"    duration: \"{video['duration']}\"")
        out.append(f"    duration_seconds: {video['duration_seconds']}")
        if video["published"]:
            out.append(f"    published: \"{video['published']}\"")
        out.append(f"    level: {video['level']}")
        out.append(f"    topic: {json.dumps(video['topic'])}")
        out.append("")

    return "\n".join(out).rstrip() + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stdout", action="store_true", help="print instead of writing")
    parser.add_argument("--out", default="academy.yaml", help="output path")
    args = parser.parse_args()

    items = fetch_playlist_items()
    details = {item["id"]: video_details(item["id"]) for item in items}

    videos = []
    uncurated = []
    for item in items:
        level, topic = CURATION.get(item["id"], ("Beginner", ""))
        if item["id"] not in CURATION:
            uncurated.append(f"{item['id']} ({item['title']})")
        extra = details.get(item["id"], {})
        videos.append(
            {
                **item,
                "duration_seconds": parse_duration(item["duration"]),
                "published": extra.get("published", ""),
                "summary": extra.get("summary", ""),
                "level": level,
                "topic": topic,
            }
        )

    text = render(videos)
    if args.stdout:
        sys.stdout.write(text)
    else:
        with open(args.out, "w", encoding="utf-8") as handle:
            handle.write(text)
        print(f"wrote {args.out} - {len(videos)} videos", file=sys.stderr)

    if uncurated:
        print(
            "warning: no CURATION entry (defaulted to Beginner, no topic):\n  "
            + "\n  ".join(uncurated),
            file=sys.stderr,
        )


if __name__ == "__main__":
    main()
