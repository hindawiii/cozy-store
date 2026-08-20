import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { profitPercent, sar } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/my-store")({
  head: () => ({
    meta: [
      { title: "منتجات متجري | بايع" },
      { name: "description", content: "أدر منتجات متجرك وحدد سعر البيع الخاص بك لكل منتج." },
      { property: "og:title", content: "منتجات متجري | بايع" },
      { property: "og:description", content: "تحكم بأسعار البيع وهوامش الربح لكل منتج." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyStorePage,
});

function MyStorePage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products")
        .select("id, custom_price, products(id, name, emoji, category, selling_price, supplier_price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setPrice = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase
        .from("store_products")
        .update({ custom_price: price })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-products"] });
      toast.success("تم تحديث سعر البيع");
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("تمت إزالة المنتج من متجرك");
    },
  });

  const items = data ?? [];

  return (
    <AppShell title="منتجات متجري" subtitle="حدد سعر بيعك وراقب هامش ربحك لكل منتج">
      {isLoading ? (
        <div className="card-soft p-16 text-center text-muted-foreground">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="card-soft p-16 text-center">
          <p className="text-muted-foreground">لم تضف أي منتج بعد.</p>
          <Button asChild variant="hero" size="pill" className="mt-6">
            <Link to="/products">تصفح الكتالوج</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((it) =>
            it.products ? (
              <article key={it.id} className="card-soft flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-3xl">
                    {it.products.emoji}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold">{it.products.name}</h3>
                    <p className="text-xs text-muted-foreground">{it.products.category}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  سعر المورد: {sar(Number(it.products.supplier_price))}
                </p>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = Number(new FormData(e.currentTarget).get("price"));
                    if (v > 0) setPrice.mutate({ id: it.id, price: v });
                  }}
                >
                  <Input
                    name="price"
                    type="number"
                    min={1}
                    defaultValue={Number(it.custom_price ?? it.products.selling_price)}
                    className="h-11"
                  />
                  <Button type="submit" variant="hero" size="pill">
                    حفظ
                  </Button>
                </form>
                <div className="mt-auto flex items-center justify-between">
                  <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">
                    ربح{" "}
                    {profitPercent(
                      Number(it.custom_price ?? it.products.selling_price),
                      Number(it.products.supplier_price),
                    )}
                    %
                  </span>
                  <button
                    className="text-destructive"
                    aria-label="حذف"
                    onClick={() => remove.mutate(it.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ) : null,
          )}
        </div>
      )}
    </AppShell>
  );
}
