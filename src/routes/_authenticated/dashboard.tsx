import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم البائع | بايع" },
      {
        name: "description",
        content: "تابع طلباتك وأرباحك ومنتجاتك الأكثر مبيعاً من لوحة تحكم بايع.",
      },
      { property: "og:title", content: "لوحة تحكم البائع | بايع" },
      { property: "og:description", content: "إحصائيات الطلبات والأرباح والمنتجات في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [ordersRes, storeRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*, products(name, emoji)")
          .order("created_at", { ascending: false }),
        supabase.from("store_products").select("id", { count: "exact", head: true }),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      return { orders: ordersRes.data ?? [], storeCount: storeRes.count ?? 0 };
    },
  });

  const orders = data?.orders ?? [];
  const delivered = orders.filter((o) => o.status === "delivered");
  const netProfit = delivered.reduce((s, o) => s + Number(o.profit ?? 0), 0);
  const deliveryRate = orders.length
    ? Math.round((delivered.length / orders.length) * 100)
    : 0;

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const v = orders
      .filter((o) => {
        const od = new Date(o.created_at);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      })
      .reduce((s, o) => s + Number(o.profit ?? 0), 0);
    return { m: months[d.getMonth()] ?? "", v };
  });

  const stats = [
    { icon: ShoppingBag, label: "إجمالي الطلبات", value: orders.length },
    { icon: Wallet, label: "صافي الأرباح المحققة (ر.س)", value: netProfit },
    { icon: Package, label: "منتجات في متجري", value: data?.storeCount ?? 0 },
    { icon: TrendingUp, label: "معدل التسليم %", value: deliveryRate },
  ];

  return (
    <AppShell title="لوحة تحكم البائع" subtitle="بيانات حقيقية من متجرك، محدثة لحظياً">
      {isLoading ? (
        <div className="card-soft p-16 text-center text-muted-foreground">جاري تحميل بياناتك...</div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <article key={s.label} className="card-soft p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand">
                  <s.icon className="size-5 text-primary-foreground" />
                </span>
                <div className="mt-4 text-2xl font-extrabold">
                  {s.value.toLocaleString("ar-EG")}
                </div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </article>
            ))}
          </div>

          <div className="card-soft mt-8 p-6">
            <h2 className="mb-6 font-bold">تطور الأرباح الشهرية</h2>
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="m" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--color-chart-1)"
                    strokeWidth={3}
                    fill="url(#g)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-soft mt-8 overflow-x-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold">أحدث الطلبات</h2>
              <Button asChild variant="heroOutline" size="pill">
                <Link to="/orders">كل الطلبات</Link>
              </Button>
            </div>
            {orders.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">
                لا توجد طلبات بعد — أضف منتجاً من الكتالوج ثم أنشئ أول طلب.
              </p>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 6).map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-bold">
                        <Link to="/orders/$orderId" params={{ orderId: o.id }} className="text-primary">
                          #{o.order_number}
                        </Link>
                      </TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
