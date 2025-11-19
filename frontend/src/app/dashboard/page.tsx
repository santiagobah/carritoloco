"use client";

import { useSession } from '@/contexts/SessionContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut, ShoppingCart, Plus, List } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useSession();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Bienvenido, {user.firstName}
              </p>
            </div>
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* tarjeta */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              {user.isAdmin && (
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>

        {/* acciones rapidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {user.sell && (
            <>
              <Link
                href="/productos/crear"
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Crear Producto</h3>
                    <p className="text-sm text-gray-600">Agregar nuevo producto</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/productos/mis-productos"
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition">
                    <List className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mis Productos</h3>
                    <p className="text-sm text-gray-600">Ver y editar productos</p>
                  </div>
                </div>
              </Link>
            </>
          )}

          <Link
            href="/pounto_venta"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Punto de Venta</h3>
                <p className="text-sm text-gray-600">Realizar ventas</p>
              </div>
            </div>
          </Link>

          <Link
            href="/productos"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ver Catálogo</h3>
                <p className="text-sm text-gray-600">Explorar productos</p>
              </div>
            </div>
          </Link>
        </div>

        {/* opciones para modificar tu ceunta */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración de Cuenta</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Tipo de cuenta</p>
                <p className="text-sm text-gray-600">
                  {user.sell && user.buy && 'Vendedor y Comprador'}
                  {user.sell && !user.buy && 'Solo Vendedor'}
                  {!user.sell && user.buy && 'Solo Comprador'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
