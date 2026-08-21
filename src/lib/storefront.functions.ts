import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

const checkoutSchema = z.object({
  sellerId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().trim().min(7).max(20),
  customerCity: z.string().trim().min(2).max(60),
  customerAddress: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(itemSchema).min(1).max(10),
});

export const placeCustomerOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = data.items.map((i) => i.productId);

    const { data: storeRows, error: storeError } = await supabaseAdmin
      .from("store_products")
      .select("product_id, custom_price, products(id, selling_price, supplier_price, is_active)")
      .eq("user_id", data.sellerId)
      .in("product_id", ids);
    if (storeError) throw new Error(storeError.message);

    const orders = data.items.map((item) => {
      const row = storeRows?.find((r) => r.product_id === item.productId);
      const product = row?.products as
        | { id: string; selling_price: number; supplier_price: number; is_active: boolean }
        | null
        | undefined;
      if (!row || !product || !product.is_active) {
        throw new Error("منتج غير متاح في هذا المتجر");
      }
      const unitPrice = Number(row.custom_price ?? product.selling_price);
      return {
        user_id: data.sellerId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: unitPrice,
        supplier_price: Number(product.supplier_price),
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_city: data.customerCity,
        customer_address: data.customerAddress ?? null,
        notes: data.notes ?? null,
        source: "customer",
      };
    });

    const { data: inserted, error } = await supabaseAdmin
      .from("orders")
      .insert(orders)
      .select("order_number");
    if (error) throw new Error(error.message);

    return { orderNumbers: (inserted ?? []).map((o) => o.order_number) };
  });
