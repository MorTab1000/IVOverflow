import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function sha512(password: string): string {
  return createHash("sha512").update(password).digest("hex");
}

const users = [
  {
    nickname: "dev_alice",
    fullName: "Alice Cohen",
    email: "alice@ivtech.dev",
    password: "password123",
  },
  {
    nickname: "dev_bob",
    fullName: "Bob Levi",
    email: "bob@ivtech.dev",
    password: "password123",
  },
  {
    nickname: "dev_carol",
    fullName: "Carol Mizrahi",
    email: "carol@ivtech.dev",
    password: "password123",
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        nickname: user.nickname,
        fullName: user.fullName,
        email: user.email,
        passwordHash: sha512(user.password),
      },
    });
  }

  console.log(`Seeded ${users.length} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
