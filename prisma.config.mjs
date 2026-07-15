import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseCommands = new Set(["db", "migrate", "studio"]);
const needsDatabaseUrl = process.argv.some((arg) => databaseCommands.has(arg));

if (needsDatabaseUrl && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum tersedia. Tambahkan DATABASE_URL di .env sebelum menjalankan perintah database Prisma.");
}

const datasource = process.env.DATABASE_URL
  ? {
      url: process.env.DATABASE_URL,
    }
  : undefined;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource,
});
