import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { sar, statusLabel, statusTone, type OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | بايع" },
      {
        name: "description",
        content: "إدارة كتالوج المنتجات والتجار وكل الطلبات في منصة بايع.",
      },
      { property: "og:title", content: "لوحة الإدارة | بايع" },
      { property: "og:description", content: "إضافة المنتجات ومتابعة التجار والطلبات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type ProductRow = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  image_url: string | null;
  description: string | null;
  supplier_price: number;
  selling_price: number;
  stock: number;
  rating: number;
  is_active: boolean;
};

const emptyForm = {
  id: "",
  name: "",
  category: "",
  emoji: "📦",
  image_url: "",
  description: "",
  supplier_price: "",
  selling_price: "",
  stock: "0",
  is_active: true,
};

function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...emptyForm });
  const [open, setOpen] = useState(false);

  const productsQ = useQuery({
    queryKey: ["admin-products"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductRow[];
    },
  });

  const sellersQ = useQuery({
    queryKey: ["admin-sellers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, store_name, city, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const ordersQ = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_city, quantity, unit_price, profit, status, source, created_at, products(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        emoji: form.emoji.trim() || "📦",
        image_url: form.image_url.trim() || null,
        description: form.description.trim() || null,
        supplier_price: Number(form.supplier_price),
        selling_price: Number(form.selling_price),
        stock: Number(form.stock),
        is_active: form.is_active,
      };
      if (!payload.name || !payload.category) throw new Error("اسم المنتج والقسم مطلوبان");
      if (!(payload.selling_price > 0) || !(payload.supplier_price >= 0))
        throw new Error("تحقق من الأسعار");
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["catalog-products"] });
      setForm({ ...emptyForm });
      setOpen(false);
      toast.success("تم حفظ المنتج");
    },
    onError: (e: Error) => toast.error(e.message || "تعذر حفظ المنتج"),
  });

  const toggleActive = useMutation({
    mutationFn: async (p: ProductRow) => {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !p.is_active })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: () => toast.error("تعذر تحديث حالة المنتج"),
  });

  if (loading) {
    return (
      <AppShell title="لوحة الإدارة">
        <div className="card-soft p-16 text-center text-muted-foreground">جاري التحميل...</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell title="لوحة الإدارة">
        <div className="card-soft flex flex-col items-center gap-3 p-16 text-center">
          <ShieldAlert className="size-8 text-muted-foreground" />
          <p className="font-bold">هذه الصفحة مخصّصة لفريق الإدارة فقط.</p>
          <p className="text-sm text-muted-foreground">
            إذا كنت المسؤول عن المنصة اطلب إضافة صلاحية "مدير" لحسابك.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="لوحة الإدارة" subtitle="إدارة الكتالوج والتجار وكل الطلبات">
      <Tabs defaultValue="products">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="sellers">التجار</TabsTrigger>
          <TabsTrigger value="orders">كل الطلبات</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="pt-6">
          <div className="mb-4 flex justify-end">
            <Button
              variant="hero"
              size="pill"
              onClick={() => {
                setForm({ ...emptyForm });
                setOpen((v) => !v);
              }}
            >
              <Plus className="size-4" /> منتج جديد
            </Button>
          </div>

          {open && (
            <form
              className="card-soft mb-6 grid gap-4 p-6 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="p-name">اسم المنتج</Label>
                <Input
                  id="p-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-cat">القسم</Label>
                <Input
                  id="p-cat"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-img">رابط صورة المنتج</Label>
                <Input
                  id="p-img"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-emoji">رمز بديل عند غياب الصورة</Label>
                <Input
                  id="p-emoji"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-sup">سعر التكلفة</Label>
                <Input
                  id="p-sup"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.supplier_price}
                  onChange={(e) => setForm({ ...form, supplier_price: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-sell">سعر البيع المقترح</Label>
                <Input
                  id="p-sell"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.selling_price}
                  onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock">الكمية المتوفرة</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="p-desc">الوصف</Label>
                <Textarea
                  id="p-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <Button type="submit" variant="hero" size="pill" disabled={save.isPending}>
                  {save.isPending ? "جاري الحفظ..." : "حفظ المنتج"}
                </Button>
                <Button
                  type="button"
                  variant="heroOutline"
                  size="pill"
                  onClick={() => {
                    setOpen(false);
                    setForm({ ...emptyForm });
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          )}

          <div className="card-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>التكلفة</TableHead>
                  <TableHead>البيع</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(productsQ.data ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="flex items-center gap-3 font-bold">
                      <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-accent text-xl">
                        <ProductImage src={p.image_url} emoji={p.emoji} alt={p.name} />
                      </span>
                      {p.name}
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{sar(Number(p.supplier_price))}</TableCell>
                    <TableCell>{sar(Number(p.selling_price))}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? "default" : "secondary"}>
                        {p.is_active ? "معروض" : "مخفي"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2 space-x-reverse whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setForm({
                            id: p.id,
                            name: p.name,
                            category: p.category,
                            emoji: p.emoji,
                            image_url: p.image_url ?? "",
                            description: p.description ?? "",
                            supplier_price: String(p.supplier_price),
                            selling_price: String(p.selling_price),
                            stock: String(p.stock),
                            is_active: p.is_active,
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil className="size-4" /> تعديل
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive.mutate(p)}>
                        {p.is_active ? "إخفاء" : "عرض"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="sellers" className="pt-6">
          <div className="card-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المتجر</TableHead>
                  <TableHead>الجوال</TableHead>
                  <TableHead>المدينة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sellersQ.data ?? []).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold">{s.full_name ?? "—"}</TableCell>
                    <TableCell>{s.store_name ?? "—"}</TableCell>
                    <TableCell dir="ltr">{s.phone ?? "—"}</TableCell>
                    <TableCell>{s.city ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="pt-6">
          <div className="card-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>المصدر</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ordersQ.data ?? []).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-bold">#{o.order_number}</TableCell>
                    <TableCell>{o.products?.name ?? "—"}</TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell>{o.customer_city}</TableCell>
                    <TableCell>{sar(Number(o.unit_price) * o.quantity)}</TableCell>
                    <TableCell>{o.source === "customer" ? "متجر العميل" : "التاجر"}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[o.status as OrderStatus]}`}
                      >
                        {statusLabel[o.status as OrderStatus]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
