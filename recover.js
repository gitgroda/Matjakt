const fs = require('fs');
const lines = fs.readFileSync('/home/fredde/.gemini/antigravity-cli/brain/07d6e5df-ddf0-487b-b8bb-0d93e2acbbd8/.system_generated/logs/transcript_full.jsonl', 'utf-8').split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  const step = JSON.parse(lines[i]);
  if (step.type === 'VIEW_FILE' && step.content && step.content.includes('Header.tsx') && step.content.includes('Total Lines')) {
     console.log('Found VIEW_FILE. Printing content:');
     console.log(step.content);
     break;
  }
}
