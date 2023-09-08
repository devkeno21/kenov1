import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { env } from "~/env.mjs"; 

const dbHost = env.DATABASE_HOST
const dbUsername = env.DATABASE_USERNAME
const dbPassword = env.DATABASE_PASSWORD

const connection = mysql.createPool({
  database: "kenov1",
  host: dbHost!,
  user: dbUsername!,
  password: dbPassword!
});
 
const db = drizzle(connection);

await migrate(db, { migrationsFolder: './drizzle' });