import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { migrate } from 'drizzle-orm/mysql2/migrator';
 
const connection = mysql.createPool({
  database: "kenov1",
  host: process.env["DATABASE_HOST"],
  user: process.env["DATABASE_USERNAME"],
  password: process.env["DATABASE_PASSWORD"]
});
 
const db = drizzle(connection);

await migrate(db, { migrationsFolder: './drizzle' });