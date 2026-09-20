import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const match = await prisma.match.findFirst({ orderBy: { id: 'desc' } });
  console.log("Latest Match ID:", match?.id);
  const qs = await prisma.question.findMany({ where: { gameId: match?.gameId } });
  console.log("Questions in latest game:", qs.length);
  if (qs.length > 0) {
    console.log("Sample question:", qs[0]);
  }
}
main();
