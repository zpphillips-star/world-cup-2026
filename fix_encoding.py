#!/usr/bin/env python3
"""
Fix CP1252-over-UTF8 double-encoding corruption in src/ files.

Pattern: UTF-8 bytes were read as CP1252, then the CP1252 string was saved as UTF-8.
Reverse: take the garbled UTF-8 text, encode back to CP1252, decode as UTF-8.
"""

import os
import re
import sys

FILES = [
    r"src\app\(tabs)\bracket\BracketClient.tsx",
    r"src\app\(tabs)\calendar\CalendarClient.tsx",
    r"src\app\(tabs)\groups\GroupsClient.tsx",
    r"src\app\(tabs)\schedule\ScheduleClient.tsx",
    r"src\app\(tabs)\today\TodayClient.tsx",
    r"src\components\MatchCard.tsx",
    r"src\components\TeamSheet.tsx",
    r"src\lib\mockProvider.ts",
]

def try_fix_chunk(s):
    """Try to decode a string chunk as CP1252->UTF8."""
    try:
        fixed = s.encode('cp1252').decode('utf-8')
        return fixed
    except (UnicodeEncodeError, UnicodeDecodeError):
        return None

# Characters that could be part of a CP1252 mojibake sequence
# These are chars in U+0080..U+00FF range that CP1252 maps to
SUSPECT_RANGE = set(
    chr(c) for c in range(0x80, 0x100)
    if c not in (0x81, 0x8D, 0x8F, 0x90, 0x9D)  # undefined in CP1252
) | {'┬', '╖', '╢', '╜', '┐'}  # box drawing that appear as corruption artifacts

def fix_text(content):
    """
    Scan through text and fix any CP1252-double-encoded sequences.
    Uses a greedy approach: try the longest window first.
    """
    result = []
    i = 0
    n = len(content)
    fixes = []
    
    while i < n:
        c = content[i]
        # Is this char potentially part of a corrupted sequence?
        if ord(c) > 127:
            # Try window sizes from longest to shortest (max 12 chars for 4-byte UTF8 mojibake)
            fixed = None
            fix_len = 0
            for size in range(12, 1, -1):
                if i + size > n:
                    continue
                chunk = content[i:i+size]
                decoded = try_fix_chunk(chunk)
                if decoded is not None and decoded != chunk:
                    # Verify the decoded result makes sense (has higher codepoint chars = emoji/unicode)
                    # and the original chunk doesn't already look like valid unicode
                    if any(ord(ch) > 0xFF for ch in decoded):
                        fixed = decoded
                        fix_len = size
                        break
            
            if fixed is not None:
                fixes.append((i, content[i:i+fix_len], fixed))
                result.append(fixed)
                i += fix_len
            else:
                result.append(c)
                i += 1
        else:
            result.append(c)
            i += 1
    
    return ''.join(result), fixes


def process_file(filepath, dry_run=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()
    
    fixed, fixes = fix_text(original)
    
    if fixes:
        print(f"\n{'DRY RUN: ' if dry_run else ''}Fixed {len(fixes)} corrupted sequence(s) in {filepath}:")
        for pos, orig, decoded in fixes:
            # Find line number
            line_num = original[:pos].count('\n') + 1
            print(f"  Line {line_num}: {repr(orig)} -> {repr(decoded)}")
        
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f"  -> Saved.")
    else:
        print(f"  No corruption found in {filepath}")
    
    return len(fixes)


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    
    total = 0
    for f in FILES:
        total += process_file(f, dry_run=dry_run)
    
    print(f"\nTotal fixes: {total}")
