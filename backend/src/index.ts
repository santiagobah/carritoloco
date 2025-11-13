import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "admin",
  database: process.env.DB_NAME || "cybersec",
  port: Number(process.env.DB_PORT) || 5432,
});

// pruebaa:
app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows); // 👈 esto devuelve un arreglo
} catch (err: any) {
  console.error("Error en consulta:", err);
  res.status(500).json({ error: err.message });
}
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Servidor backend en puerto ${PORT}`));