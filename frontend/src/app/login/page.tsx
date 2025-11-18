"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

    if (res.ok) {
      router.push("/");
    } else {
      alert("Credenciales incorrectas");
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Accede a tu cuenta</h1>
        <p>Ingresa con tu correo y contraseña</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="buttons-container">
            <a href="/register" className="create-account-link">
              Crear cuenta
            </a>

            <button type="submit" className="next-button">
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}