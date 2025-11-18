import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta";

router.post("/register", async (req: Request, res: Response) => {
  const { name_p, ap_pat, account, password } = req.body;

  try {
    // hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // insertar usuario en personas
    const person = await pool.query(
      `INSERT INTO personas (name_p, ap_pat, sell, buy)
       VALUES ($1, $2, true, true)
       RETURNING person_id`,
      [name_p, ap_pat]
    );

    const person_id = person.rows[0].person_id;

    // insertar contraseña
    await pool.query(
      `INSERT INTO user_pass (person_id, account, password)
       VALUES ($1, $2, $3)`,
      [person_id, account, hashedPassword]
    );

    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// 🟩 LOGIN
router.post("/login", async (req: Request, res: Response) => {
  const { account, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM user_pass WHERE account = $1",
      [account]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Usuario no encontrado" });

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { person_id: user.person_id, account: user.account },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ message: "Login exitoso", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en login" });
  }
});

export default router;