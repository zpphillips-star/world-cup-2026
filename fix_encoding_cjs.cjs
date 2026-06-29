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

const replacements = [
  ['\u2261\u0192\u00f9\u2563', '\uD83C\uDFDF\uFE0F'],
  ['\u2261\u0192\u00ff\u00d1', '\u26BD'],
  ['\u2261\u0192\u00d1\u00b6', '\uD83C\uDFC6'],
  ['\u2261\u0192\u00f4\u00ec', '\uD83D\uDCC5'],
  ['\u2261\u0192\u00ee\u00ff', '\uD83C\uDF0D'],
  ['\u2261\u0192\u0192\u00d1', '\u26BD'],
  ['\u2261\u0192\u00c5\u00e5', '\uD83E\uDD45'],
  ['\u0393\u00c7\u00f4', '\u2013'],
  ['\u0393\u00c7\u00f6', '\u2014'],
  ['\u0393\u00c7\u00a3', '\u201C'],
  ['\u0393\u00c7\u00a5', '\u201D'],
  ['\u0393\u00c7\u00ff', '\u2018'],
  ['\u0393\u00c7\u00d6', '\u2019'],
  ['\u0393\u00f9\u00c5', '\u2B50'],
  ['\u0393\u00dc\u255C', '\u2705'],
  ['\u0393\u00a3\u00f2', '\u2713'],
  ['\u0393\u00e5\u00c6', '\u2192'],
  ['\u252C\u2556', '\u00B7'],
];

let totalChanges = 0;

for (const relPath of files) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) { console.log('SKIP: ' + relPath); continue; }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = 0;
  
  for (const [bad, good] of replacements) {
    const count = content.split(bad).length - 1;
    if (count > 0) {
      content = content.split(bad).join(good);
      changed += count;
    }
  }
  
  if (changed > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('FIXED (' + changed + ' replacements): ' + relPath);
    totalChanges += changed;
  } else {
    console.log('CLEAN: ' + relPath);
  }
}

console.log('\nTotal replacements: ' + totalChanges);
