"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  prod_id: number;
  name_pr: string;
  cat: string;
  person_id: number;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  // Productos de ejemplo para fallback
  const fallbackProducts: Product[] = [
    { prod_id: 1, name_pr: "Smartphone XYZ", cat: "Electrónica", person_id: 1 },
    { prod_id: 2, name_pr: "Auriculares Bluetooth", cat: "Accesorios", person_id: 2 },
    { prod_id: 3, name_pr: "Cámara DSLR", cat: "Fotografía", person_id: 3 },
    { prod_id: 4, name_pr: "Camiseta Casual", cat: "Ropa", person_id: 4 },
    { prod_id: 5, name_pr: "Lámpara de Mesa", cat: "Hogar", person_id: 5 },
    { prod_id: 6, name_pr: "Juego de Construcción", cat: "Juguetes", person_id: 6 },
    { prod_id: 7, name_pr: "Pelota de Fútbol", cat: "Deportes", person_id: 7 },
    { prod_id: 8, name_pr: "Set de Maquillaje", cat: "Belleza", person_id: 8 },
    { prod_id: 9, name_pr: "Comida para Perros", cat: "Mascotas", person_id: 9 },
    { prod_id: 10, name_pr: "Novela Bestseller", cat: "Libros", person_id: 10 },
    { prod_id: 11, name_pr: "Kit de Herramientas", cat: "Automotriz", person_id: 11 },
    { prod_id: 12, name_pr: "Tablet ABC", cat: "Tecnología", person_id: 12 },
    { prod_id: 13, name_pr: "Vitaminas Multivitamínicas", cat: "Salud", person_id: 13 },
  ];

  // Obtener productos desde el backend
  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);

          // Extraer categorías únicas
          const uniqueCats = [
            "Todas",
            ...new Set(data.map((p: Product) => p.cat || "Sin categoría")),
          ];
          setCategories(uniqueCats);
        } else {
          // Si no hay datos válidos, usar productos de ejemplo
          setProducts(fallbackProducts);

          // Categorías de ejemplo ampliadas
          const exampleCategories = [
            "Todas",
            "Electrónica",
            "Accesorios",
            "Fotografía",
            "Ropa",
            "Hogar",
            "Juguetes",
            "Deportes",
            "Belleza",
            "Mascotas",
            "Libros",
            "Automotriz",
            "Tecnología",
            "Salud",
          ];
          setCategories(exampleCategories);
        }
      })
      .catch((err) => {
        console.error("Error al obtener productos:", err);
        // En caso de error, usar productos de ejemplo
        setProducts(fallbackProducts);

        const exampleCategories = [
          "Todas",
          "Electrónica",
          "Accesorios",
          "Fotografía",
          "Ropa",
          "Hogar",
          "Juguetes",
          "Deportes",
          "Belleza",
          "Mascotas",
          "Libros",
          "Automotriz",
          "Tecnología",
          "Salud",
        ];
        setCategories(exampleCategories);
      });
  }, []);

  // Filtrar productos por categoría seleccionada
  const filteredProducts =
    selectedCategory === "Todas"
      ? products
      : products.filter((p) => p.cat === selectedCategory);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-8 text-center">
        🛍️ Catálogo de Productos
      </h1>

      {/* Filtro de categorías */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full border transition-all ${
              selectedCategory === cat
                ? "bg-orange-500 text-white border-orange-600 shadow"
                : "bg-white text-orange-500 border-orange-300 hover:bg-orange-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.prod_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4"
            >
              <Image
                src="/products/default.jpg"
                alt={product.name_pr}
                width={300}
                height={200}
                className="rounded-md object-cover w-full h-48"
              />
              <h3 className="text-lg font-semibold mt-3">
                {product.name_pr}
              </h3>
              <p className="text-sm text-gray-500">{product.cat}</p>
              <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-12">
          No hay productos disponibles en esta categoría.
        </p>
      )}
    </main>
  );
}