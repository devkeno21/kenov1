import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import { env } from "~/env.mjs";

const dbHost = env.DATABASE_HOST;
const dbUsername = env.DATABASE_USERNAME;
const dbPassword = env.DATABASE_PASSWORD;
// create the connection
const connection = connect({
  host: dbHost,
  username: dbUsername,
  password: dbPassword,
});

export const db = drizzle(connection);
// import { drizzle } from "drizzle-orm/mysql2";
// import mysql from "mysql2/promise";
// import { migrate } from 'drizzle-orm/mysql2/migrator';

// /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

// const connection = mysql.createPool({
//   database: "kenov1",

// });

// const db = drizzle(connection);

// await migrate(db, { migrationsFolder: './drizzle' });
