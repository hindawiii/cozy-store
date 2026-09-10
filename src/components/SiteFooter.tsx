import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const quick = [
  { label: "الرئيسية", to: "/" },
  { label: "المنتجات", to: "/products" },
  { label: "الأسعار", to: "/pricing" },
  { label: "التسجيل", to: "/register" },
];

const support = [
  { label: "تواصل معنا", to: "/contact" },
  { label: "الشروط والأحكام", to: "/terms" },
  { label: "سياسة الخصوصية", to: "/privacy" },
  { label: "الاستبدال والاسترجاع", to: "/refund" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-ink text-background">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <div className="text-2xl font-extrabold text-brand">بايع</div>
          <p className="text-sm leading-8 opacity-70">
            منصة متكاملة للتجارة الإلكترونية تتيح لك البيع بدون رأس مال أو مخزون، ونحن نتولى التخزين
            والشحن والتحصيل.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
              <span
                key={i}
                className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">روابط سريعة</h3>
          <ul className="space-y-3 text-sm opacity-75">
            {quick.map((q) => (
              <li key={q.to}>
                <Link to={q.to} className="transition-opacity hover:opacity-100">
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">الدعم</h3>
          <ul className="space-y-3 text-sm opacity-75">
            {support.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">نشرة بريدية</h3>
          <p className="mb-4 text-sm opacity-70">اشترك ليصلك كل جديد عن المنتجات الرابحة.</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Input
              type="email"
              required
              placeholder="بريدك الإلكتروني"
              className="h-11 rounded-xl border-background/20 bg-background/10 text-background placeholder:text-background/50"
            />
            <Button type="submit" variant="hero" className="h-11 rounded-xl px-5">
              اشترك
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs opacity-60 md:flex-row">
          <p>© 2026 بايع. جميع الحقوق محفوظة.</p>
          <div className="flex gap-3">
            {["Visa", "Mastercard", "مدى", "Apple Pay", "STC Pay"].map((p) => (
              <span key={p} className="rounded-md bg-background/10 px-3 py-1">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
