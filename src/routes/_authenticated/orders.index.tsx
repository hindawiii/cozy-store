import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { sar, statusLabel, statusTone, type OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "طلباتي | بايع" },
      { name: "description", content: "أنشئ الطلبات وتابع حالتها من الاستلام حتى التسليم." },
      { property: "og:title", content: "طلباتي | بايع" },
      { property: "og:description", content: "إدارة كاملة لطلبات عملائك وأرباحك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");

  const ordersQ = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, products(name, emoji)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const storeQ = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products")
        .select("custom_price, products(id, name, emoji, selling_price, supplier_price)");
      if (error) throw error;
      return data;
    },
  });

  const createOrder = useMutation({
    mutationFn: async (form: FormData) => {
      const { data: auth } = await supabase.auth.getUser();
      const picked = storeQ.data?.find((s) => s.products?.id === productId);
      if (!picked?.products) throw new Error("اختر منتجاً من متجرك");
      const unit = Number(picked.custom_price ?? picked.products.selling_price);
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: auth.user!.id,
          product_id: picked.products.id,
          quantity: Number(form.get("quantity") || 1),
          unit_price: unit,
          supplier_price: Number(picked.products.supplier_price),
          customer_name: String(form.get("customer_name")),
          customer_phone: String(form.get("customer_phone")),
          customer_city: String(form.get("customer_city")),
          customer_address: String(form.get("customer_address") || ""),
          notes: String(form.get("notes") || ""),
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setProductId("");
      toast.success("تم إنشاء الطلب وإرساله للتجهيز والشحن");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const orders = ordersQ.data ?? [];

  return (
    <AppShell title="الطلبات" subtitle="أنشئ طلباً لعميلك وتابعه حتى التسليم والتحصيل">
      <div className="mb-6 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="pill">
              <Plus className="size-4" /> طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء طلب جديد</DialogTitle>
              <DialogDescription>
                اختر منتجاً من متجرك وأدخل بيانات العميل، ونحن نتكفل بالشحن والتحصيل.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                createOrder.mutate(new FormData(e.currentTarget));
              }}
            >
              <div className="space-y-2">
                <Label>المنتج</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر من منتجات متجرك" />
                  </SelectTrigger>
                  <SelectContent>
                    {(storeQ.data ?? []).map((s) =>
                      s.products ? (
                        <SelectItem key={s.products.id} value={s.products.id}>
                          {s.products.emoji} {s.products.name} —{" "}
                          {sar(Number(s.custom_price ?? s.products.selling_price))}
                        </SelectItem>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
                {(storeQ.data ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    متجرك فارغ — أضف منتجات من الكتالوج أولاً.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">اسم العميل</Label>
                  <Input id="customer_name" name="customer_name" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">جوال العميل</Label>
                  <Input id="customer_phone" name="customer_phone" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_city">المدينة</Label>
                  <Input id="customer_city" name="customer_city" required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_address">العنوان بالتفصيل</Label>
                <Input id="customer_address" name="customer_address" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات للمندوب</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <Button
                type="submit"
                variant="hero"
                size="pill"
                className="w-full"
                disabled={createOrder.isPending || !productId}
              >
                {createOrder.isPending ? "جاري الحفظ..." : "تأكيد الطلب"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-soft overflow-x-auto p-6">
        {ordersQ.isLoading ? (
          <p className="py-10 text-center text-muted-foreground">جاري التحميل...</p>
        ) : orders.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">لا توجد طلبات بعد.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">المدينة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الربح</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-bold">#{o.order_number}</TableCell>
                  <TableCell className="max-w-56 truncate">
                    {o.products?.emoji} {o.products?.name}
                  </TableCell>
                  <TableCell>{o.customer_name}</TableCell>
                  <TableCell>{o.customer_city}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-full border-none ${statusTone[o.status as OrderStatus]}`}>
                      {statusLabel[o.status as OrderStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">{sar(Number(o.profit ?? 0))}</TableCell>
                  <TableCell>
                    <Link
                      to="/orders/$orderId"
                      params={{ orderId: o.id }}
                      className="text-sm font-bold text-primary"
                    >
                      تفاصيل
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AppShell>
  );
}
