import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const team32 = await prisma.team.findUnique({ where: { id: 32 } });
  console.log("Team 32:", team32.currentPosition);
  const team31 = await prisma.team.findUnique({ where: { id: 31 } });
  console.log("Team 31:", team31.currentPosition);
}
main();
