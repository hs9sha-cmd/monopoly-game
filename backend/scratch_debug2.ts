import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const teams = await prisma.team.findMany({ 
    where: { matchId: 18 } 
  });
  console.log("Teams in Match 18:", teams);
}
main();
