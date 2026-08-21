import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Minus, Plus, ShoppingBag, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { placeCustomerOrder } from "@/lib/storefront.functions";
import { sar } from "@/lib/orders";

type StorefrontRow = {
  store_name: string;
  city: string | null;
  product_id: string;
  name: string;
  emoji: string;
  category: string;
  description: string | null;
  price: number;
  rating: number;
  stock: number;
};

export const Route = createFileRoute("/store/$sellerId")({
  head: () => ({
    meta: [
      { title: "متجر إلكتروني | بايع" },
      {
        name: "description",
        content: "تصفح منتجات المتجر واطلب أونلاين مع الدفع عند الاستلام والتوصيل لكل مدن المملكة.",
      },
      { property: "og:title", content: "متجر إلكتروني | بايع" },
      { property: "og:description", content: "منتجات مختارة، طلب سريع، ودفع عند الاستلام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { sellerId } = Route.useParams();
  const checkout = useServerFn(placeCustomerOrder);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [done, setDone] = useState<number[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const storeQ = useQuery({
    queryKey: ["storefront", sellerId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_storefront" as never, {
        p_seller: sellerId,
      } as never);
      if (error) throw error;
      return (data ?? []) as unknown as StorefrontRow[];
    },
  });

  const rows = storeQ.data ?? [];
  const storeName = rows[0]?.store_name ?? "متجر بايع";
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ row: rows.find((r) => r.product_id === id), qty }))
        .filter((x): x is { row: StorefrontRow; qty: number } => !!x.row),
    [cart, rows],
  );
  const total = cartItems.reduce((s, i) => s + Number(i.row.price) * i.qty, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const dec = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  const removeItem = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("السلة فارغة");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await checkout({
        data: {
          sellerId,
          customerName: String(fd.get("name") ?? ""),
          customerPhone: String(fd.get("phone") ?? ""),
          customerCity: String(fd.get("city") ?? ""),
          customerAddress: String(fd.get("address") ?? ""),
          notes: String(fd.get("notes") ?? ""),
          items: cartItems.map((i) => ({ productId: i.row.product_id, quantity: i.qty })),
        },
      });
      setDone(res.orderNumbers);
      setCart({});
      toast.success("تم استلام طلبك بنجاح");
    } catch {
      toast.error("تعذر إرسال الطلب، تحقق من البيانات وحاول مجدداً");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="container-page flex items-center justify-between py-5">
          <div>
            <h1 className="text-xl font-extrabold md:text-2xl">{storeName}</h1>
            <p className="text-xs text-muted-foreground">
              {rows[0]?.city ? `${rows[0].city} • ` : ""}الدفع عند الاستلام
            </p>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            مدعوم من بايع
          </Link>
        </div>
      </header>

      <main className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <section>
          {storeQ.isLoading ? (
            <div className="card-soft p-16 text-center text-muted-foreground">جاري التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="card-soft p-16 text-center text-muted-foreground">
              لا توجد منتجات في هذا المتجر حالياً.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((p) => (
                <article key={p.product_id} className="card-soft flex flex-col overflow-hidden">
                  <div className="flex h-40 items-center justify-center bg-accent text-6xl">
                    {p.emoji}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="line-clamp-2 font-bold">{p.name}</h2>
                    {p.description ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                    ) : null}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3.5 fill-primary text-primary" />
                      {Number(p.rating).toFixed(1)}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-extrabold">{sar(Number(p.price))}</span>
                      <Button variant="hero" size="pill" onClick={() => add(p.product_id)}>
                        <Plus className="size-4" /> أضف للسلة
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="card-soft h-fit space-y-5 p-6 lg:sticky lg:top-8">
          <h2 className="flex items-center gap-2 font-bold">
            <ShoppingBag className="size-5" /> سلة الطلب
          </h2>

          {done ? (
            <div className="space-y-3 text-sm">
              <p className="font-bold text-success">تم استلام طلبك ✓</p>
              <p className="text-muted-foreground">
                رقم الطلب: {done.map((n) => `#${n}`).join("، ")} — سنتواصل معك على جوالك لتأكيد
                الطلب.
              </p>
              <Button variant="heroOutline" size="pill" onClick={() => setDone(null)}>
                طلب جديد
              </Button>
            </div>
          ) : (
            <>
              {cartItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">سلتك فارغة، اختر منتجاً للبدء.</p>
              ) : (
                <ul className="space-y-3">
                  {cartItems.map(({ row, qty }) => (
                    <li key={row.product_id} className="flex items-center gap-3 text-sm">
                      <span className="text-2xl">{row.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{row.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sar(Number(row.price) * qty)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button aria-label="إنقاص" onClick={() => dec(row.product_id)}>
                          <Minus className="size-4" />
                        </button>
                        <span className="w-5 text-center">{qty}</span>
                        <button aria-label="زيادة" onClick={() => add(row.product_id)}>
                          <Plus className="size-4" />
                        </button>
                        <button
                          aria-label="حذف"
                          className="text-destructive"
                          onClick={() => removeItem(row.product_id)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between border-t pt-4 font-bold">
                <span>الإجمالي</span>
                <span>{sar(total)}</span>
              </div>

              <form className="space-y-3" onSubmit={submit}>
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" name="name" required className="mt-1 h-11" />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input id="phone" name="phone" required className="mt-1 h-11" />
                </div>
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input id="city" name="city" required className="mt-1 h-11" />
                </div>
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input id="address" name="address" className="mt-1 h-11" />
                </div>
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea id="notes" name="notes" className="mt-1" rows={2} />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="pill"
                  className="w-full"
                  disabled={submitting || cartItems.length === 0}
                >
                  {submitting ? "جاري الإرسال..." : "تأكيد الطلب (دفع عند الاستلام)"}
                </Button>
              </form>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
