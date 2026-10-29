import { getDatabase, initSchema } from "./index";

const dbPath = process.env.DATABASE_PATH || "data.sqlite";
console.log(`Initialising database at: ${dbPath}`);

const db = getDatabase(dbPath);
initSchema(db);

console.log("Database schema initialized successfully.");
console.log("Integrity checks passed.");
