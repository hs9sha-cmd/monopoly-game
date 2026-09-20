const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const match = await prisma.match.findFirst({ orderBy: { id: 'desc' } });
  if (!match) return;
  const teams = await prisma.team.findMany({ where: { matchId: match.id } });
  console.log("Teams in latest match:");
  teams.forEach(t => console.log(`ID: ${t.id}, Name: ${t.name}, Pos: ${t.currentPosition}`));
}
main();
