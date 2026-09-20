import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const match = await prisma.match.findFirst({ orderBy: { id: 'desc' }, include: { teams: true } });
  console.log(match);
}
main();
