"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  prod_id: number;
  name_pr: string;
  cat: string;
  person_id: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:4001/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error al obtener productos:", err));
  }, []);

  return (
    <>
      <header className="bg-orange-500 text-white flex items-center justify-between px-8 py-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🛒 Carrito Loco
        </h1>
        <nav className="flex space-x-6">
        <Link href="/" className="hover:bg-orange-600 px-3 py-2 rounded transition">
            Inicio
        </Link>
        <Link href="/productos" className="hover:bg-orange-600 px-3 py-2 rounded transition">
            Productos
        </Link>
        <Link href="/pagos" className="hover:bg-orange-600 px-3 py-2 rounded transition">
            Pagos
        </Link>
        <Link href="/login" className="hover:bg-orange-600 px-3 py-2 rounded transition">
            Login
        </Link>
        <Link href="/pounto_venta" className="hover:bg-green-600 px-3 py-2 rounded transition bg-green-500 text-white font-medium">
          Punto de Venta
        </Link>
        </nav>
      </header>

      <main className="p-8 bg-gray-100 min-h-screen">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-semibold mb-4 text-orange-500">
            Bienvenido a Carrito Loco
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Productos cargados desde la base de datos 🎉
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.prod_id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <Image
                src="/products/default.jpg"
                alt={product.name_pr}
                width={300}
                height={200}
                className="rounded-md object-cover w-full h-48"
              />
              <h3 className="text-lg font-semibold mt-3">{product.name_pr}</h3>
              <p className="text-orange-500 font-bold mt-1">{product.cat}</p>
              <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
                Agregar al carrito
              </button>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}