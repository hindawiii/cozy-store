import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { categories, products, profitPct } from "@/lib/store-data";

type ProductSearch = { cat?: string | undefined };

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch =>
    typeof search["cat"] === "string" ? { cat: search["cat"] } : {},

  head: () => ({
    meta: [
      { title: "كتالوج المنتجات | بايع" },
      {
        name: "description",
        content: "تصفح آلاف المنتجات المجربة بهوامش ربح واضحة، وفلترة حسب القسم والسعر والربح.",
      },
      { property: "og:title", content: "كتالوج المنتجات | بايع" },
      { property: "og:description", content: "منتجات مجربة بهوامش ربح واضحة وجاهزة للبيع فوراً." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { cat } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(cat ? [cat] : []);
  const [maxPrice, setMaxPrice] = useState(400);
  const [inStock, setInStock] = useState(false);
  const [highProfit, setHighProfit] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.includes(query.trim()) &&
          (selected.length === 0 || selected.includes(p.category)) &&
          p.sellingPrice <= maxPrice &&
          (!inStock || p.stock > 40) &&
          (!highProfit || profitPct(p) >= 45),
      ),
    [query, selected, maxPrice, inStock, highProfit],
  );

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container-page pt-32 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">كتالوج المنتجات</h1>
            <p className="mt-2 text-muted-foreground">
              {list.length} منتج متاح للبيع الآن بهامش ربح واضح
            </p>
          </div>
          <div className="flex w-full gap-3 md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="h-12 rounded-xl pr-10"
              />
            </div>
            <Button
              variant="heroOutline"
              className="h-12 rounded-xl px-4 lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="size-4" /> فلترة
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside
            className={`card-soft h-fit space-y-7 p-6 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div>
              <h2 className="mb-4 font-bold">الأقسام</h2>
              <div className="space-y-3">
                {categories.map((c) => (
                  <label key={c.name} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={selected.includes(c.name)}
                      onCheckedChange={() => toggle(c.name)}
                    />
                    <span>
                      {c.emoji} {c.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-bold">أقصى سعر بيع: {maxPrice} ر.س</h2>
              <Slider
                value={[maxPrice]}
                min={50}
                max={400}
                step={10}
                onValueChange={(v) => setMaxPrice(v[0] ?? 400)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="stock">المتوفر فقط</Label>
              <Switch id="stock" checked={inStock} onCheckedChange={setInStock} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="profit">ربح مرتفع (+45%)</Label>
              <Switch id="profit" checked={highProfit} onCheckedChange={setHighProfit} />
            </div>

            <Button
              variant="heroOutline"
              className="w-full rounded-xl"
              onClick={() => {
                setSelected([]);
                setMaxPrice(400);
                setInStock(false);
                setHighProfit(false);
                setQuery("");
              }}
            >
              إعادة ضبط الفلاتر
            </Button>
          </aside>

          <div>
            {list.length === 0 ? (
              <div className="card-soft p-16 text-center text-muted-foreground">
                لا توجد منتجات مطابقة لبحثك.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <article
                    key={p.id}
                    className="card-soft flex h-full flex-col overflow-hidden hover:-translate-y-2 hover:shadow-card-hover"
                  >
                    <div className="relative flex h-44 items-center justify-center bg-accent text-6xl">
                      {p.emoji}
                      <span className="absolute top-3 right-3 rounded-full bg-card px-3 py-1 text-xs font-bold">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <h3 className="line-clamp-2 font-bold">{p.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3.5 fill-primary text-primary" />
                        {p.rating.toFixed(1)} • متوفر {p.stock} قطعة
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="block text-xs text-muted-foreground line-through">
                            {p.supplierPrice} ر.س
                          </span>
                          <span className="text-lg font-extrabold">{p.sellingPrice} ر.س</span>
                        </div>
                        <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">
                          ربح {profitPct(p)}%
                        </span>
                      </div>
                      <Button
                        variant="hero"
                        size="pill"
                        className="mt-auto w-full"
                        onClick={() => toast.success(`تمت إضافة «${p.name}» إلى متجرك`)}
                      >
                        أضف لمتجري
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
