import type { Config } from "drizzle-kit";
import 'dotenv/config'
import { env } from "~/env.mjs";


const dbUrl = env.DATABASE_URL
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    connectionString: dbUrl!,
  },
} satisfies Config;
