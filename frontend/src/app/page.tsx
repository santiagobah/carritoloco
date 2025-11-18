"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/contexts/SessionContext";
import { ShoppingCart, User, LogIn, Package } from "lucide-react";

interface Product {
  prod_id: number;
  name_pr: string;
  description: string;
  price: number;
  stock: number;
  name_cat: string;
  barcode: string;
}

interface Category {
  cat_id: number;
  name_cat: string;
}

export default function Home() {
  const { user } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/productos/list").then(res => res.json()),
      fetch("/api/categorias").then(res => res.json())
    ])
    .then(([productsData, categoriesData]) => {
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    })
    .catch(err => console.error("Error al obtener datos:", err))
    .finally(() => setLoading(false));
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.cat_id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingCart className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Carrito Loco</h1>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link
                href="/productos"
                className="hover:bg-orange-600 px-4 py-2 rounded transition flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Productos
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-white text-orange-500 px-4 py-2 rounded font-medium hover:bg-orange-50 transition flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-white text-orange-500 px-4 py-2 rounded font-medium hover:bg-orange-50 transition flex items-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-400 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-4">Bienvenido a Carrito Loco</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Tu tienda en línea con punto de venta integrado
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/productos"
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition"
            >
              Ver Catálogo
            </Link>
            {!user && (
              <Link
                href="/register"
                className="bg-orange-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-900 transition"
              >
                Registrarse
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full font-medium transition ${
              !selectedCategory
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Todas
          </button>
          {categories.slice(0, 10).map(cat => (
            <button
              key={cat.cat_id}
              onClick={() => setSelectedCategory(cat.cat_id)}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedCategory === cat.cat_id
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat.name_cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.prod_id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition"
              >
                <div className="p-4">
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name_pr}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.name_cat}</p>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {product.description || "Sin descripción"}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-orange-600">${product.price}</span>
                    <span className="text-sm text-gray-500">{product.stock} en stock</span>
                  </div>
                  <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">No se encontraron productos en esta categoría</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Carrito Loco. Sistema POS Full-Stack.</p>
        </div>
      </footer>
    </div>
  );
}
