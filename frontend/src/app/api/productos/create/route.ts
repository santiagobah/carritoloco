import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { productSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Desestructuramos los datos del formulario
    const { name_pr, description, cat_id, price, stock, barcode, image_url } = validation.data;

    // 1. INSERTAR EL PRODUCTO
    // Corrección: Usamos 'sale_price' y 'cost_price' en lugar de 'price'.
    // Quitamos 'stock' de aquí porque va en otra tabla.
    const productResult = await query(
      `INSERT INTO products (name_pr, description, cat_id, person_id, sale_price, cost_price, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING prod_id`,
      [
        name_pr, 
        description || null, 
        cat_id, 
        user.userId, 
        price, // Se guarda como Precio de Venta
        price, // Se guarda temporalmente también como Costo (puedes cambiarlo luego)
        image_url || null
      ]
    );

    const prodId = productResult.rows[0].prod_id;

    // 2. INSERTAR EL STOCK (INVENTARIO)
    // El esquema usa la tabla 'inventory' ligada a una sucursal (branch_id).
    // Usamos branch_id = 1 (Matriz) por defecto.
    if (stock !== undefined) {
      await query(
        `INSERT INTO inventory (prod_id, branch_id, quantity)
         VALUES ($1, 1, $2)
         ON CONFLICT (prod_id, branch_id) DO UPDATE SET quantity = $2`,
        [prodId, stock]
      );
    }

    // 3. INSERTAR EL CÓDIGO DE BARRAS
    if (barcode) {
      await query(
        `INSERT INTO barcodes (prod_id, barcode) VALUES ($1, $2)`,
        [prodId, barcode]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      productId: prodId,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Error al crear producto', details: error.message },
      { status: 500 }
    );
  }
}