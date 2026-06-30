const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map of corrupted sequences -> correct UTF-8
const replacements = [
  ['┬╖', '·'],
  ['ΓÇô', '–'],
  ['ΓÇö', '—'],
  ['ΓÇ£', '"'],
  ['ΓÇ¥', '"'],
  ['ΓÇÿ', '\u2018'],
  ['ΓÇÖ', '\u2019'],
  ['≡ƒÿÑ', '⚽'],
  ['≡ƒÑ¶', '🏆'],
  ['≡ƒôì', '📅'],
  ['≡ƒù╣', '🏟️'],
  ['ΓùÅ', '⭐'],
  ['ΓÜ╜', '✅'],
  ['Γ£ò', '✓'],
  ['ΓåÆ', '→'],
  ['≡ƒîÿ', '🌍'],
  ['≡ƒÅ░', '🎯'],
  ['≡ƒôè', '📊'],
  ['ΓÇó', '•'],
  ['≡ƒÄ╖', '🏴'],
  ['≡ƒÇ║', '🚀'],
];

function getAllFiles(dir, exts = ['.tsx', '.ts', '.js']) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.next' || item === '.git') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(getAllFiles(full, exts));
    else if (exts.some(e => full.endsWith(e))) results.push(full);
  }
  return results;
}

const files = getAllFiles('./src');
let totalFixes = 0;
const changed = [];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const [bad, good] of replacements) {
    while (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const count = (original.length - content.length);
    changed.push(file.replace('./src/', 'src/'));
    totalFixes++;
    console.log('Fixed: ' + file.replace(process.cwd() + '\\', ''));
  }
}

console.log('\nTotal files fixed: ' + totalFixes);
