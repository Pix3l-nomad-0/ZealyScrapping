import asyncio, re, csv, sys
from urllib.parse import urlparse
from pathlib import Path
import pandas as pd
from playwright.async_api import async_playwright

SOCIAL_MAP = {
    "discord": re.compile(r"discord\.(gg|com)", re.I),
    "twitter": re.compile(r"(x\.com|twitter\.com)", re.I),
    "telegram": re.compile(r"(t\.me|telegram\.)", re.I),
}

def slug_from(line: str) -> str:
    line=line.strip()
    if not line: return ""
    if line.startswith("http"):
        # expected forms: https://zealy.io/cw/<slug>/...
        parts = [p for p in urlparse(line).path.split("/") if p]
        return parts[1] if len(parts)>=2 and parts[0]=="cw" else ""
    return line  # assume it's already a slug

async def grab_links(p, slug):
    url = f"https://zealy.io/cw/{slug}/leaderboard?show-info=true"
    await p.goto(url, wait_until="domcontentloaded")
    # Wait for modal (dialog) to appear
    await p.wait_for_selector('[role="dialog"]', timeout=10000)
    modal = p.locator('[role="dialog"]')

    # Collect all external links inside the dialog
    hrefs = await modal.locator('a[href^="http"]').evaluate_all(
        "els => els.map(e => e.href)"
    )
    hrefs = [h for h in hrefs if "zealy.io" not in h.lower()]

    # Deduplicate keeping first occurrences
    seen, links = set(), []
    for h in hrefs:
        if h not in seen:
            links.append(h); seen.add(h)

    # Classify
    out = {"slug": slug, "website": "", "discord": "", "twitter": "", "telegram": ""}

    for h in links:
        lower = h.lower()
        matched = False
        for key, rx in SOCIAL_MAP.items():
            if rx.search(lower):
                if not out[key]:
                    out[key] = h
                matched = True
                break
        if not matched and not out["website"]:
            # treat as website if it isn't a known social
            out["website"] = h

    return out

async def main(path_in: str, path_out: str):
    slugs = []
    for line in Path(path_in).read_text(encoding="utf-8").splitlines():
        s = slug_from(line)
        if s: slugs.append(s)
    slugs = list(dict.fromkeys(slugs))  # unique, keep order

    rows = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        for i, slug in enumerate(slugs, 1):
            try:
                row = await grab_links(page, slug)
            except Exception as e:
                row = {"slug": slug, "website": "", "discord": "", "twitter": "", "telegram": "", "error": str(e)}
            rows.append(row)
        await browser.close()

    df = pd.DataFrame(rows)
    df.to_csv(path_out, index=False)
    print(f"Wrote {len(df)} rows to {path_out}")

if __name__ == "__main__":
    # Usage: python zealy_socials.py slugs.txt output.csv
    in_path  = sys.argv[1] if len(sys.argv) > 1 else "slugs.txt"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "socials.csv"
    asyncio.run(main(in_path, out_path))