const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teamId = 25; // ID of Team ดวง
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  console.log("Current position:", team.currentPosition);

  // simulate q.penaltySpaces = -3 (ลื่นน้ำมันถอย 3)
  const penaltySpacesFromFrontend = 3; 

  let newPosition = team.currentPosition;
  newPosition -= penaltySpacesFromFrontend; 

  console.log("New position (after -= 3):", newPosition);

  if (newPosition < 0) {
    newPosition = 20 + (newPosition % 20);
    console.log("Wrapped negative position:", newPosition);
  }

  // simulate q.penaltySpaces = 5 (เดินหน้า 5)
  const penaltySpacesFromFrontend2 = -5;
  let newPosition2 = team.currentPosition;
  newPosition2 -= penaltySpacesFromFrontend2;
  
  console.log("New position (after -= -5):", newPosition2);
}
main();
