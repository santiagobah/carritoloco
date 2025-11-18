"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    ap_pat: "",
    ap_mat: "",
    email: "",
    password: "",
  });

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Cuenta creada con éxito. Ahora inicia sesión.");
      router.push("/login");
    } else {
      alert(data.error || "Error al registrarse");
    }
  }

  return (
    <main className="min-h-screen flex justify-center items-center bg-sky-200 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Crear cuenta</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <input
            name="ap_pat"
            placeholder="Apellido paterno"
            value={form.ap_pat}
            onChange={handleChange}
            required
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <input
            name="ap_mat"
            placeholder="Apellido materno"
            value={form.ap_mat}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <input
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <input
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            type="password"
            required
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <button
            className="bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </main>
  );
}