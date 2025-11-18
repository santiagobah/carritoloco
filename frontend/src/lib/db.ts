import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL no está definida en .env.local");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
};