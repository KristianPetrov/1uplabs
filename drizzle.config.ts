import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) {
    throw new Error("DATABASE_URL is missing. Create a .env file with DATABASE_URL=... in the project root.");
}

export default defineConfig({
    schema: "./app/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url,
    },
    strict: true,
    verbose: true,
});


