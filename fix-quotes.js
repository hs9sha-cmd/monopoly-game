const fs = require('fs');
const files = [
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx',
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/admin/page.tsx',
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/page.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Find backtick opened strings that end in a single quote, e.g. `${API_URL}/api/admin/matches'
  // and replace the ending single quote with a backtick
  content = content.replace(/\`\$\{API_URL\}([^']*?)'/g, "`\${API_URL}$1`");
  fs.writeFileSync(file, content);
}
