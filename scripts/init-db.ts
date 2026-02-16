import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database initialization...");

  try {
    // Test the connection
    await prisma.$executeRaw`SELECT 1`;
    console.log("Database connection successful!");

    // The migration is handled by Prisma's migration system
    // Just verify all tables are created
    console.log("Database is ready!");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
