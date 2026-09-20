const fs = require('fs');
let code = fs.readFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/layout.tsx', 'utf8');

code = code.replace(
  'import { Geist, Geist_Mono } from "next/font/google";',
  'import { Geist, Geist_Mono, Mali } from "next/font/google";'
);

code = code.replace(
  'const geistMono = Geist_Mono({',
  `const mali = Mali({\n  weight: ['400', '500', '600', '700'],\n  variable: "--font-mali",\n  subsets: ["thai", "latin"],\n});\n\nconst geistMono = Geist_Mono({`
);

code = code.replace(
  'className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}',
  'className={`${geistSans.variable} ${geistMono.variable} ${mali.variable} h-full antialiased font-sans`}'
);

fs.writeFileSync('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/layout.tsx', code);
