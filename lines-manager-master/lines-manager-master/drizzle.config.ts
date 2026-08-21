import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não encontrada, certifique-se que o banco foi provisionado");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./server/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
