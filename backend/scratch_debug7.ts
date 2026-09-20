import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const match = await prisma.match.findFirst({ orderBy: { id: 'desc' } });
  if (!match) return;
  const qs = await prisma.question.findMany({ where: { gameId: match.gameId } });
  console.log("Questions in latest match:");
  qs.forEach(q => console.log(q.category, "| Text:", q.questionText, "| Penalty:", q.penaltySpaces));
}
main();
