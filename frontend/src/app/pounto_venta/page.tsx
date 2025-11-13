"use client";

import { useState } from "react";

interface SaleItem {
  barcode: string;
  name: string;
  price: number;
  qty: number;
}

export default function POSPage() {
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [total, setTotal] = useState(0);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barcode.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:4001/api/product?code=${barcode}`
      );
      const data = await res.json();

      if (data && data.name_pr) {
        const existing = items.find((item) => item.barcode === barcode);

        let newItems;
        if (existing) {
          newItems = items.map((item) =>
            item.barcode === barcode
              ? { ...item, qty: item.qty + 1 }
              : item
          );
        } else {
          newItems = [
            ...items,
            {
              barcode,
              name: data.name_pr,
              price: 100, // puedes reemplazar esto si tu API devuelve precio
              qty: 1,
            },
          ];
        }

        setItems(newItems);
        setTotal(newItems.reduce((sum, i) => sum + i.price * i.qty, 0));
      } else {
        alert("Producto no encontrado");
      }

      setBarcode("");
    } catch (err) {
      console.error("Error al buscar producto:", err);
      alert("Error al conectar con el servidor");
    }
  };

  const handleRemove = (code: string) => {
    const newItems = items.filter((i) => i.barcode !== code);
    setItems(newItems);
    setTotal(newItems.reduce((sum, i) => sum + i.price * i.qty, 0));
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-green-600 mb-6 text-center">
        💳 Punto de Venta
      </h1>

      {/* Escáner / entrada de código */}
      <form
        onSubmit={handleAddItem}
        className="flex justify-center mb-8 gap-2"
      >
        <input
          type="text"
          placeholder="Escanea o escribe el código de barras"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Agregar
        </button>
      </form>

      {/* Lista de artículos */}
      {items.length > 0 ? (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.barcode} className="border-b">
                  <td>{item.barcode}</td>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.qty).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleRemove(item.barcode)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="text-right text-xl font-bold mt-4 text-green-600">
            Total: ${total.toFixed(2)}
          </div>

          <div className="flex justify-end mt-6">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Finalizar venta
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Escanea un producto para comenzar</p>
      )}
    </main>
  );
}