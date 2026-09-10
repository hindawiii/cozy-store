import { ProductImage } from "@/components/ProductImage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
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
  image_url: string | null;
  category: string;
  description: string | null;
  price: number;
  rating: number;
  stock: number;
};

export const Route = createFileRoute("/store/$sellerId/product/$productId")({
  head: () => ({
    meta: [
      { title: "تفاصيل المنتج | بايع" },
      {
        name: "description",
        content: "تفاصيل المنتج والسعر والتقييم مع طلب سريع ودفع عند الاستلام وتوصيل لكل المدن.",
      },
      { property: "og:title", content: "تفاصيل المنتج | بايع" },
      { property: "og:description", content: "اطلب المنتج الآن مع الدفع عند الاستلام." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { sellerId, productId } = Route.useParams();
  const checkout = useServerFn(placeCustomerOrder);
  const [qty, setQty] = useState(1);
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
  const product = rows.find((r) => r.product_id === productId);
  const related = rows.filter((r) => r.product_id !== productId).slice(0, 3);
  const storeName = rows[0]?.store_name ?? "متجر بايع";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
          items: [{ productId, quantity: qty }],
        },
      });
      setDone(res.orderNumbers);
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
          <Link
            to="/store/$sellerId"
            params={{ sellerId }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="size-4" /> العودة إلى {storeName}
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            مدعوم من بايع
          </Link>
        </div>
      </header>

      <main className="container-page py-10">
        {storeQ.isLoading ? (
          <div className="card-soft p-16 text-center text-muted-foreground">جاري التحميل...</div>
        ) : !product ? (
          <div className="card-soft p-16 text-center text-muted-foreground">
            هذا المنتج غير متوفر في المتجر.
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-6">
              <div className="card-soft flex h-72 items-center justify-center bg-accent text-8xl">
                {product.emoji}
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <h1 className="text-2xl font-extrabold md:text-3xl">{product.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="size-4 fill-primary text-primary" />
                  {Number(product.rating).toFixed(1)}
                  <span>•</span>
                  <span>{product.stock > 0 ? "متوفر" : "غير متوفر حالياً"}</span>
                </div>
                <p className="text-3xl font-extrabold">{sar(Number(product.price))}</p>
                {product.description ? (
                  <p className="leading-relaxed text-muted-foreground">{product.description}</p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card-soft flex items-center gap-3 p-4 text-sm">
                  <Truck className="size-5 text-primary" /> توصيل لكل مدن المملكة
                </div>
                <div className="card-soft flex items-center gap-3 p-4 text-sm">
                  <ShieldCheck className="size-5 text-primary" /> الدفع عند الاستلام
                </div>
              </div>

              {related.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="font-bold">منتجات أخرى من المتجر</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {related.map((r) => (
                      <Link
                        key={r.product_id}
                        to="/store/$sellerId/product/$productId"
                        params={{ sellerId, productId: r.product_id }}
                        className="card-soft flex flex-col gap-2 p-4"
                      >
                        <span className="text-4xl">{r.emoji}</span>
                        <span className="line-clamp-2 text-sm font-semibold">{r.name}</span>
                        <span className="text-sm font-bold">{sar(Number(r.price))}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <aside className="card-soft h-fit space-y-5 p-6 lg:sticky lg:top-8">
              <h2 className="font-bold">اطلب الآن</h2>
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الكمية</span>
                    <div className="flex items-center gap-3">
                      <button aria-label="إنقاص" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                        <Minus className="size-4" />
                      </button>
                      <span className="w-6 text-center font-bold">{qty}</span>
                      <button aria-label="زيادة" onClick={() => setQty((q) => Math.min(20, q + 1))}>
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4 font-bold">
                    <span>الإجمالي</span>
                    <span>{sar(Number(product.price) * qty)}</span>
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
                      disabled={submitting}
                    >
                      {submitting ? "جاري الإرسال..." : "تأكيد الطلب (دفع عند الاستلام)"}
                    </Button>
                  </form>
                </>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
