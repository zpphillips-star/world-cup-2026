const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(tabs)/bracket/BracketClient.tsx',
  'src/app/(tabs)/calendar/CalendarClient.tsx',
  'src/app/(tabs)/groups/GroupsClient.tsx',
  'src/app/(tabs)/schedule/ScheduleClient.tsx',
  'src/app/(tabs)/today/TodayClient.tsx',
  'src/components/MatchCard.tsx',
  'src/lib/mockProvider.ts',
];

// Ordered longest-first to avoid partial-match collisions
const replacements = [
  // Emoji (4-byte sequences, longest first)
  ['≡ƒù╣', '🏟️'],
  ['≡ƒÿÑ', '⚽'],
  ['≡ƒÑ¶', '🏆'],
  ['≡ƒôì', '📅'],
  ['≡ƒîÿ', '🌍'],
  ['≡ƒƒÑ', '⚽'],   // alternate corruption of ⚽ seen in schedule/today
  ['≡ƒÅå', '🥅'],   // goal/net emoji seen in bracket+matchcard
  // Punctuation
  ['ΓÇô', '–'],
  ['ΓÇö', '—'],
  ['ΓÇ£', '\u201C'],
  ['ΓÇ¥', '\u201D'],
  ['ΓÇÿ', '\u2018'],
  ['ΓÇÖ', '\u2019'],
  ['ΓùÅ', '⭐'],
  ['ΓÜ╜', '✅'],
  ['Γ£ò', '✓'],
  ['ΓåÆ', '→'],
  ['┬╖', '·'],
];

let totalChanges = 0;

for (const relPath of files) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) { console.log(`SKIP (not found): ${relPath}`); continue; }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = 0;
  
  for (const [bad, good] of replacements) {
    const count = (content.split(bad).length - 1);
    if (count > 0) {
      content = content.split(bad).join(good);
      changed += count;
      console.log(`  ${relPath}: replaced ${count}x "${bad}" → "${good}"`);
    }
  }
  
  if (changed > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✓ ${relPath}: ${changed} replacements written`);
    totalChanges += changed;
  } else {
    console.log(`  - ${relPath}: no changes needed`);
  }
}

console.log(`\nDone. Total replacements: ${totalChanges}`);
