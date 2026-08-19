#!/usr/bin/env python3
"""Guard the <krkn-hub-scenario id> markers on scenario pages. Refs #566.

Three rules: one page per id, one marker per page, and a page with no marker must
say why. Only the first marker on a page is ever read, so a second one is dead.

A page counts as a scenario page when its directory holds _tab-*.md files.
Section landing pages have none and are skipped.

Exit 0 ok, 1 on a violation.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "content/en/docs/scenarios"
MARKER = re.compile(r'<krkn-hub-scenario\s+id="([^"]+)"')
# The reason is required: a bare "none" is the silence this check exists to stop.
# re.S because real opt-outs wrap over several lines.
OPT_OUT = re.compile(r'<!--\s*krkn-hub-scenario:\s*none\b[.:\s]*(.*?)-->', re.S)


def opted_out(text):
    """True only for an opt-out that gives a reason."""
    found = OPT_OUT.search(text)
    return bool(found and found.group(1).strip())


def scenario_pages():
    """(page, directory) for every page that documents a runnable scenario."""
    for index in sorted(ROOT.rglob("_index.md")):
        if any(index.parent.glob("_tab-*.md")):
            yield index, index.parent


def main() -> int:
    claims: dict[str, list[str]] = {}
    missing: list[str] = []
    extra: list[tuple[str, list[str]]] = []

    for index, directory in scenario_pages():
        rel = directory.relative_to(ROOT).as_posix()
        text = index.read_text(encoding="utf-8", errors="replace")
        ids = MARKER.findall(text)
        if ids:
            # Claim on the first, the only one anything reads.
            claims.setdefault(ids[0], []).append(rel)
            if len(ids) > 1:
                extra.append((rel, ids))
        elif not opted_out(text):
            missing.append(rel)

    problems = []

    # 1. One page per id.
    for scenario_id, pages in sorted(claims.items()):
        if len(pages) > 1:
            problems.append(
                f'id "{scenario_id}" is claimed by {len(pages)} pages: '
                + ", ".join(pages)
            )

    # 2. One marker per page.
    for rel, ids in extra:
        problems.append(
            f"{rel} declares {len(ids)} markers ({', '.join(ids)}). A page "
            f'documents one scenario, and only "{ids[0]}" is ever read.'
        )

    # 3. Silence must be deliberate.
    for rel in missing:
        problems.append(
            f"{rel} has no marker and no opt-out. Add the marker, or "
            "<!-- krkn-hub-scenario: none. <reason> --> if the page has no "
            "krkn-hub scenario of its own."
        )

    if problems:
        print("Scenario marker check failed:\n", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        print(
            f"\n{len(problems)} problem(s). See "
            "https://github.com/krkn-chaos/website/issues/566",
            file=sys.stderr,
        )
        return 1

    print(f"Scenario markers ok: {len(claims)} ids across "
          f"{sum(len(p) for p in claims.values())} pages, no duplicates.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
