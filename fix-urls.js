const fs = require('fs');
const files = [
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx',
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/admin/page.tsx',
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/page.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL \|\| `\$\{API_URL\}';/, "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';");
  content = content.replace(/io\(`\$\{API_URL\}'\)/, "io(API_URL)");
  content = content.replace(/fetch\(`\$\{API_URL\}'/g, "fetch(`${API_URL}");
  fs.writeFileSync(file, content);
}
