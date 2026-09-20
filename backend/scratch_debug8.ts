import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const team32 = await prisma.team.findUnique({ where: { id: 32 } });
  console.log("Team 32:", team32.currentPosition);
}
main();
