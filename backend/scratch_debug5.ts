import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const matches = await prisma.match.findMany({ include: { teams: true } });
  console.log("Matches:", matches.length);
}
main();
