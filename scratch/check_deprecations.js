import fs from 'fs';

const filePath = 'C:\\Users\\gagar\\.gemini\\antigravity\\brain\\4459d346-4cf6-408a-9dcd-386c3d6bd769\\.system_generated\\steps\\3723\\content.md';
if (!fs.existsSync(filePath)) {
  console.log('File not found:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const text = content.replace(/<[^>]+>/g, ' ');

const lines = text.split('\n');
console.log('--- Deprecation matches ---');
lines.forEach((line, idx) => {
  const l = line.toLowerCase();
  if (l.includes('deprecat') || l.includes('retir') || l.includes('versatile') || l.includes('specdec') || l.includes('active')) {
    console.log(`Line ${idx + 1}: ${line.trim().substring(0, 150)}`);
  }
});
