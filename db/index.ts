// import { drizzle } from "drizzle-orm/mysql2";
// import mysql from "mysql2/promise";
// import { migrate } from 'drizzle-orm/mysql2/migrator';
 
// const connection = mysql.createPool({
//   database: "kenov1",
//   host: process.env["DATABASE_HOST"],
//   user: process.env["DATABASE_USERNAME"],
//   password: process.env["DATABASE_PASSWORD"]
// });

// export const db = drizzle(connection);

import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
 
// create the connection
const connection = connect({
  host: process.env["DATABASE_HOST"],
  username: process.env["DATABASE_USERNAME"],
  password: process.env["DATABASE_PASSWORD"],
});
 
export const db = drizzle(connection);
async function main(){
  console.log("")
  // await migrate(db, { migrationsFolder: 'drizzle' });
}

main() 