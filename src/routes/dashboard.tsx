import { createFileRoute } from "@tanstack/react-router";
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
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { CountUp } from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products, profitPct } from "@/lib/store-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم التاجر | تاجر" },
      {
        name: "description",
        content: "تابع طلباتك وأرباحك ومنتجاتك الأكثر مبيعاً من لوحة تحكم تاجر.",
      },
      { property: "og:title", content: "لوحة تحكم التاجر | تاجر" },
      { property: "og:description", content: "إحصائيات الطلبات والأرباح والمنتجات في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const chartData = [
  { m: "يناير", v: 4200 },
  { m: "فبراير", v: 5100 },
  { m: "مارس", v: 4800 },
  { m: "أبريل", v: 6400 },
  { m: "مايو", v: 7300 },
  { m: "يونيو", v: 9100 },
];

const orders = [
  ["#10241", "سماعة بلوتوث لاسلكية Pro", "أحمد الغامدي", "الرياض", "تم التسليم", 149],
  ["#10240", "مقلاة هوائية 5 لتر", "منى الزهراني", "جدة", "قيد الشحن", 349],
  ["#10239", "ساعة ذكية بشاشة أموليد", "خالد المطيري", "الدمام", "قيد التجهيز", 249],
  ["#10238", "سيروم فيتامين سي للبشرة", "ريم القحطاني", "أبها", "تم التسليم", 89],
  ["#10237", "حقيبة مدرسية مقاومة للماء", "سلطان العنزي", "بريدة", "مرتجع", 145],
] as const;

const statusTone: Record<string, string> = {
  "تم التسليم": "bg-success text-success-foreground",
  "قيد الشحن": "bg-accent text-accent-foreground",
  "قيد التجهيز": "bg-secondary text-secondary-foreground",
  مرتجع: "bg-destructive text-destructive-foreground",
};

function DashboardPage() {
  const stats = [
    { icon: ShoppingBag, label: "إجمالي الطلبات", value: 1284, suffix: "" },
    { icon: Wallet, label: "صافي الأرباح (ر.س)", value: 37450, suffix: "" },
    { icon: Package, label: "منتجات في متجري", value: 46, suffix: "" },
    { icon: TrendingUp, label: "معدل التسليم", value: 92, suffix: "%" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <SiteNavbar />

      <section className="container-page pt-32 pb-24">
        <h1 className="text-3xl font-extrabold md:text-4xl">لوحة تحكم التاجر</h1>
        <p className="mt-2 text-muted-foreground">نظرة سريعة على أداء متجرك خلال آخر ٦ أشهر</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <article key={s.label} className="card-soft p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand">
                <s.icon className="size-5 text-primary-foreground" />
              </span>
              <div className="mt-4 text-2xl font-extrabold">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card-soft p-6 lg:col-span-2">
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

          <div className="card-soft p-6">
            <h2 className="mb-6 font-bold">أفضل المنتجات أداءً</h2>
            <ul className="space-y-4">
              {products.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-xl">
                    {p.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">ربح {profitPct(p)}%</p>
                  </div>
                  <span className="text-sm font-bold">{p.sellingPrice} ر.س</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-soft mt-8 overflow-x-auto p-6">
          <h2 className="mb-6 font-bold">أحدث الطلبات</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">المدينة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">القيمة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o[0]}>
                  <TableCell className="font-bold">{o[0]}</TableCell>
                  <TableCell className="max-w-56 truncate">{o[1]}</TableCell>
                  <TableCell>{o[2]}</TableCell>
                  <TableCell>{o[3]}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-full border-none ${statusTone[o[4]]}`}>{o[4]}</Badge>
                  </TableCell>
                  <TableCell className="font-bold">{o[5]} ر.س</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
