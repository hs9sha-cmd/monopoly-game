import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const match = await prisma.match.findFirst({ orderBy: { id: 'desc' } });
  const qs = await prisma.question.findMany({ where: { gameId: match?.gameId } });
  if (qs.length > 0) {
    console.log("Categories in DB:");
    qs.forEach(q => console.log(`'${q.category}'`));
  }
}
main();
