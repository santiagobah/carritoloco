import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Crear producto (solo si el usuario está logueado)
router.post("/", verifyToken, async (req, res) => {
  const { name_pr, cat, cat_id } = req.body;
  const { person_id } = (req as any).user;

  try {
    await pool.query(
      `INSERT INTO products (name_pr, cat, cat_id, person_id)
       VALUES ($1, $2, $3, $4)`,
      [name_pr, cat, cat_id, person_id]
    );

    res.json({ message: "Producto creado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// obtener productos
router.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});

export default router;