const fs = require('fs');
const lines = fs.readFileSync('/home/fredde/.gemini/antigravity-cli/brain/07d6e5df-ddf0-487b-b8bb-0d93e2acbbd8/.system_generated/logs/transcript_full.jsonl', 'utf-8').split('\n');
const files = {};
for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  const step = JSON.parse(lines[i]);
  // Just find the step before "git checkout" where we viewed or modified the files
  if (step.type === 'VIEW_FILE' && step.content && step.content.includes('File Path: `file:///home/fredde/matjakt/src/components/Header.tsx`') && !files['Header.tsx']) {
      files['Header.tsx'] = step.content;
  }
  if (step.type === 'VIEW_FILE' && step.content && step.content.includes('File Path: `file:///home/fredde/matjakt/src/app/page.tsx`') && !files['page.tsx']) {
      files['page.tsx'] = step.content;
  }
}
fs.writeFileSync('header_recovered.txt', files['Header.tsx'] || '');
fs.writeFileSync('page_recovered.txt', files['page.tsx'] || '');
