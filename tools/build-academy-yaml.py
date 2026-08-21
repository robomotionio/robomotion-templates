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
  * the playlist RSS   - publish dates and the opening line of each description

Only stdlib is used, so there is nothing to install.

Curation (level + topic) lives in CURATION below rather than in the YAML,
so a regeneration can never silently drop it. A video that reaches the
playlist without a CURATION entry still lands in the file; the script prints a
warning naming it so the gap gets filled.
"""

import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

PLAYLIST_ID = "PLie2idTJ_1wvlEgLuDUDt_bbAs-29xtmL"
PLAYLIST_URL = f"https://www.youtube.com/playlist?list={PLAYLIST_ID}"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?playlist_id={PLAYLIST_ID}"

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


def fetch_feed_details():
    """Publish date + first description paragraph per video, from the RSS feed."""
    ns = {
        "a": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "m": "http://search.yahoo.com/mrss/",
    }
    root = ET.fromstring(get(FEED_URL))
    details = {}
    for entry in root.findall("a:entry", ns):
        video_id = entry.findtext("yt:videoId", "", ns)
        published = entry.findtext("a:published", "", ns)[:10]
        description = entry.findtext("m:group/m:description", "", ns) or ""
        summary = description.strip().split("\n\n")[0].strip().replace("\n", " ")
        details[video_id] = {"published": published, "summary": summary}
    return details


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
    details = fetch_feed_details()

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
