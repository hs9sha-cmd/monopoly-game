const fs = require('fs');

const files = [
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx',
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/admin/page.tsx',
  '/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('API_URL')) {
    // Add API_URL definition after imports
    content = content.replace(/(import .*;\n)+/, "$&\nconst API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';\n");
    
    // Replace 'http://localhost:4000' with API_URL (for fetch)
    content = content.replace(/'http:\/\/localhost:4000/g, "`${API_URL}");
    content = content.replace(/`http:\/\/localhost:4000/g, "`${API_URL}");
  }
  
  fs.writeFileSync(file, content);
}
console.log('Done!');
