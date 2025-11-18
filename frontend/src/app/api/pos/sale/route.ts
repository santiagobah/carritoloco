import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { saleSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = saleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { items, payment_method } = validation.data;

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Create sale
    const saleResult = await query(
      `INSERT INTO sales (person_id, total, payment_method, status)
       VALUES ($1, $2, $3, $4)
       RETURNING sale_id`,
      [user.userId, total, payment_method, 'completed']
    );

    const saleId = saleResult.rows[0].sale_id;

    // Insert sale items and update stock
    for (const item of items) {
      // Get product name
      const productResult = await query(
        'SELECT name_pr, stock FROM products WHERE prod_id = $1',
        [item.prod_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Producto ${item.prod_id} no encontrado`);
      }

      const product = productResult.rows[0];

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name_pr}`);
      }

      // Insert sale item
      await query(
        `INSERT INTO sale_items (sale_id, prod_id, product_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.prod_id, product.name_pr, item.quantity, item.unit_price]
      );

      // Update stock
      await query(
        'UPDATE products SET stock = stock - $1 WHERE prod_id = $2',
        [item.quantity, item.prod_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Venta registrada exitosamente',
      saleId,
      total,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Sale error:', error);
    return NextResponse.json(
      { error: 'Error al registrar venta', details: error.message },
      { status: 500 }
    );
  }
}
