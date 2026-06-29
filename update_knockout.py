import re

path = r"C:\Users\zaphilli\.claw\tmp\wc2026\src\lib\mockProvider.ts"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)
print(f"Original file size: {original_len} chars")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Update group stage match statuses and scores
# ─────────────────────────────────────────────────────────────────────────────
results = {
    # Group A
    "m1": (2, 0), "m2": (2, 1), "m25": (1, 1), "m28": (1, 0), "m53": (0, 3), "m54": (1, 0),
    # Group B
    "m3": (1, 1), "m8": (1, 1), "m26": (4, 1), "m27": (6, 0), "m51": (2, 1), "m52": (3, 1),
    # Group C
    "m7": (1, 1), "m5": (0, 1), "m30": (0, 1), "m29": (3, 0), "m49": (0, 3), "m50": (4, 2),
    # Group D
    "m4": (4, 1), "m6": (2, 0), "m32": (2, 0), "m31": (0, 1), "m59": (3, 2), "m60": (0, 0),
    # Group E
    "m10": (7, 1), "m9": (1, 0), "m33": (2, 1), "m34": (0, 0), "m55": (0, 2), "m56": (2, 1),
    # Group F
    "m11": (2, 2), "m12": (5, 1), "m35": (5, 1), "m36": (0, 4), "m57": (1, 1), "m58": (1, 3),
    # Group G
    "m16": (1, 1), "m15": (2, 2), "m39": (0, 0), "m40": (1, 3), "m63": (1, 1), "m64": (1, 5),
    # Group H
    "m14": (0, 0), "m13": (1, 1), "m38": (4, 0), "m37": (2, 2), "m65": (0, 0), "m66": (0, 1),
    # Group I
    "m17": (3, 1), "m18": (1, 4), "m42": (3, 0), "m41": (3, 2), "m61": (1, 4), "m62": (5, 0),
    # Group J
    "m19": (3, 0), "m20": (3, 1), "m43": (2, 0), "m44": (1, 2), "m69": (3, 3), "m70": (1, 3),
    # Group K
    "m23": (1, 1), "m24": (1, 3), "m47": (5, 0), "m48": (1, 0), "m71": (0, 0), "m72": (3, 1),
    # Group L
    "m22": (4, 2), "m21": (1, 0), "m45": (0, 0), "m46": (0, 1), "m67": (0, 2), "m68": (2, 1),
}

gs_updated = 0
for mid, (hs, as_) in results.items():
    search = f'id: "{mid}",'
    idx = content.find(search)
    if idx == -1:
        print(f"WARN: group match {mid} not found")
        continue
    line_start = content.rfind('\n', 0, idx)
    line_end = content.find('\n', idx)
    line = content[line_start:line_end]
    if 'status: "upcoming"' not in line:
        print(f"INFO: {mid} already processed")
        continue
    new_line = line.replace(
        'status: "upcoming"',
        f'homeScore: {hs}, awayScore: {as_}, status: "ft"'
    )
    content = content[:line_start] + new_line + content[line_end:]
    gs_updated += 1

print(f"Updated {gs_updated} group stage matches")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Update knockout match kickoffs, venues, and r32-1 result
# ESPN actual schedule (source of truth)
# ─────────────────────────────────────────────────────────────────────────────
# Format: (id, new_kickoff, new_venue_id, new_status, homeScore, awayScore)
# homeScore/awayScore only set for completed matches
knockout_updates = [
    # R32
    ("r32-1",  "2026-06-28T19:00:00Z", "sofi",         "ft",       0, 1),
    ("r32-2",  "2026-06-29T20:30:00Z", "gillette",     "upcoming", None, None),
    ("r32-3",  "2026-06-30T01:00:00Z", "bbva",         "upcoming", None, None),
    ("r32-4",  "2026-06-29T17:00:00Z", "nrg",          "upcoming", None, None),
    ("r32-5",  "2026-06-30T21:00:00Z", "metlife",      "upcoming", None, None),
    ("r32-6",  "2026-06-30T17:00:00Z", "att",          "upcoming", None, None),
    ("r32-7",  "2026-07-01T01:00:00Z", "azteca",       "upcoming", None, None),
    ("r32-8",  "2026-07-01T16:00:00Z", "mercedesbenz", "upcoming", None, None),
    ("r32-9",  "2026-07-02T00:00:00Z", "levis",        "upcoming", None, None),
    ("r32-10", "2026-07-01T20:00:00Z", "lumen",        "upcoming", None, None),
    ("r32-11", "2026-07-02T23:00:00Z", "bmo",          "upcoming", None, None),
    ("r32-12", "2026-07-02T19:00:00Z", "sofi",         "upcoming", None, None),
    ("r32-13", "2026-07-03T03:00:00Z", "bcplace",      "upcoming", None, None),
    ("r32-14", "2026-07-03T22:00:00Z", "hardrock",     "upcoming", None, None),
    ("r32-15", "2026-07-04T01:30:00Z", "arrowhead",    "upcoming", None, None),
    ("r32-16", "2026-07-03T18:00:00Z", "att",          "upcoming", None, None),
    # R16
    ("r16-1",  "2026-07-04T17:00:00Z", "metlife",      "upcoming", None, None),
    ("r16-2",  "2026-07-04T21:00:00Z", "att",          "upcoming", None, None),
    ("r16-3",  "2026-07-05T20:00:00Z", "sofi",         "upcoming", None, None),
    ("r16-4",  "2026-07-06T00:00:00Z", "hardrock",     "upcoming", None, None),
    ("r16-5",  "2026-07-06T19:00:00Z", "nrg",          "upcoming", None, None),
    ("r16-6",  "2026-07-07T00:00:00Z", "gillette",     "upcoming", None, None),
    ("r16-7",  "2026-07-07T16:00:00Z", "mercedesbenz", "upcoming", None, None),
    ("r16-8",  "2026-07-07T20:00:00Z", "bcplace",      "upcoming", None, None),
    # QF
    ("qf-1",   "2026-07-09T20:00:00Z", "gillette",     "upcoming", None, None),
    ("qf-2",   "2026-07-10T19:00:00Z", "sofi",         "upcoming", None, None),
    ("qf-3",   "2026-07-11T21:00:00Z", "hardrock",     "upcoming", None, None),
    ("qf-4",   "2026-07-12T01:00:00Z", "arrowhead",    "upcoming", None, None),
    # SF
    ("sf-1",   "2026-07-14T19:00:00Z", "att",          "upcoming", None, None),
    ("sf-2",   "2026-07-15T19:00:00Z", "mercedesbenz", "upcoming", None, None),
    # 3rd place
    ("3rd-1",  "2026-07-18T21:00:00Z", "hardrock",     "upcoming", None, None),
    # Final
    ("final-1","2026-07-19T19:00:00Z", "metlife",      "upcoming", None, None),
]

ko_updated = 0
for kid, new_kick, new_venue, new_status, hs, aw in knockout_updates:
    search = f'id: "{kid}"'
    idx = content.find(search)
    if idx == -1:
        print(f"WARN: knockout {kid} not found")
        continue
    line_start = content.rfind('\n', 0, idx)
    line_end = content.find('\n', idx)
    line = content[line_start:line_end]

    # Replace kickoff
    line = re.sub(r'kickoff: "[^"]*"', f'kickoff: "{new_kick}"', line)
    # Replace venue
    line = re.sub(r'venue: venues\.\w+', f'venue: venues.{new_venue}', line)
    # Add score/status for completed matches
    if new_status == "ft" and hs is not None:
        line = re.sub(r'status: "upcoming"', f'homeScore: {hs}, awayScore: {aw}, status: "ft"', line)

    content = content[:line_start] + line + content[line_end:]
    ko_updated += 1

print(f"Updated {ko_updated} knockout matches")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Fix R16 pairings in getBracket() function
# ESPN actual pairings differ from the sequential i*2+1/i*2+2 pattern
# ─────────────────────────────────────────────────────────────────────────────
# Correct R16 pairings from ESPN:
# r16-1: W r32-1 vs W r32-3
# r16-2: W r32-2 vs W r32-5
# r16-3: W r32-4 vs W r32-6
# r16-4: W r32-7 vs W r32-8
# r16-5: W r32-11 vs W r32-12
# r16-6: W r32-9 vs W r32-10
# r16-7: W r32-14 vs W r32-16
# r16-8: W r32-13 vs W r32-15

r16_old = """  const r16Slots: BracketSlot[] = Array.from({ length: 8 }, (_, i) => {
    const id = `r16-${i + 1}`
    const km = knockoutMatches.find(k => k.id === id)
    return { id, home: `W R32-${i * 2 + 1}`, away: `W R32-${i * 2 + 2}`, kickoff: km?.kickoff, venue: km?.venue, status: 'tbd' as const }
  })"""

r16_new = """  const R16_PAIRS: [string, string][] = [
    ['W R32-1',  'W R32-3' ],  // r16-1
    ['W R32-2',  'W R32-5' ],  // r16-2
    ['W R32-4',  'W R32-6' ],  // r16-3
    ['W R32-7',  'W R32-8' ],  // r16-4
    ['W R32-11', 'W R32-12'],  // r16-5
    ['W R32-9',  'W R32-10'],  // r16-6
    ['W R32-14', 'W R32-16'],  // r16-7
    ['W R32-13', 'W R32-15'],  // r16-8
  ]
  const r16Slots: BracketSlot[] = R16_PAIRS.map(([home, away], i) => {
    const id = `r16-${i + 1}`
    const km = knockoutMatches.find(k => k.id === id)
    return { id, home, away, kickoff: km?.kickoff, venue: km?.venue, status: 'tbd' as const }
  })"""

if r16_old in content:
    content = content.replace(r16_old, r16_new)
    print("Fixed R16 pairings in getBracket()")
else:
    print("WARN: R16 pattern not found for replacement")

# Fix QF pairings: qf-2 should be W R16-5 vs W R16-6, qf-3 should be W R16-3 vs W R16-4
qf_old = """  const qfSlots: BracketSlot[] = Array.from({ length: 4 }, (_, i) => {
    const id = `qf-${i + 1}`
    const km = knockoutMatches.find(k => k.id === id)
    return { id, home: `W R16-${i * 2 + 1}`, away: `W R16-${i * 2 + 2}`, kickoff: km?.kickoff, venue: km?.venue, status: 'tbd' as const }
  })"""

qf_new = """  const QF_PAIRS: [string, string][] = [
    ['W R16-1', 'W R16-2'],  // qf-1
    ['W R16-5', 'W R16-6'],  // qf-2
    ['W R16-3', 'W R16-4'],  // qf-3
    ['W R16-7', 'W R16-8'],  // qf-4
  ]
  const qfSlots: BracketSlot[] = QF_PAIRS.map(([home, away], i) => {
    const id = `qf-${i + 1}`
    const km = knockoutMatches.find(k => k.id === id)
    return { id, home, away, kickoff: km?.kickoff, venue: km?.venue, status: 'tbd' as const }
  })"""

if qf_old in content:
    content = content.replace(qf_old, qf_new)
    print("Fixed QF pairings in getBracket()")
else:
    print("WARN: QF pattern not found for replacement")

# ─────────────────────────────────────────────────────────────────────────────
# Save
# ─────────────────────────────────────────────────────────────────────────────
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nSaved: {len(content)} chars (original: {original_len})")
print("Done!")

