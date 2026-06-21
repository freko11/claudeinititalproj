import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  await prisma.user.upsert({
    where: { email: "user@docflow.com" },
    update: {},
    create: {
      email: "user@docflow.com",
      passwordHash: await hash("user123"),
      role: "user",
    },
  });

  await prisma.user.upsert({
    where: { email: "approver@docflow.com" },
    update: {},
    create: {
      email: "approver@docflow.com",
      passwordHash: await hash("approver123"),
      role: "approver",
    },
  });

  console.log("Seeded: user@docflow.com / user123  and  approver@docflow.com / approver123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
