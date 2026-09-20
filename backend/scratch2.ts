import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const qs = await prisma.question.findMany({ where: { category: 'ดวง' }, orderBy: { id: 'desc' }, take: 5 });
  console.log(qs);
}
main();
