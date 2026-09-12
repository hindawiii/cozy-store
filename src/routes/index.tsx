import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Globe2,
  Package,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import heroTree from "@/assets/hero-tree.png";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { CountUp, Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ProductImage";
import { categories } from "@/lib/store-data";
import { profitPercent } from "@/lib/orders";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بايع | ابدأ تجارتك الإلكترونية بدون رأس مال" },
      {
        name: "description",
        content:
          "منصة بايع: اختر من آلاف المنتجات، سوّق عبر السوشيال ميديا، ونحن نتولى التخزين والشحن والتحصيل وتحويل أرباحك.",
      },
      { property: "og:title", content: "بايع | ابدأ تجارتك الإلكترونية بدون رأس مال" },
      {
        property: "og:description",
        content: "أكثر من ٥٠٠٠ منتج في ٢٠ قسم، شحن وتحصيل كامل، وأرباح تصلك بعد التسليم.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Package,
    title: "منتجات متنوعة وكسبانة",
    desc: "تشكيلة واسعة من المنتجات من غير ما تشيل هم التخزين ولا رأس المال",
  },
  {
    icon: Truck,
    title: "الشحن والتوصيل",
    desc: "شحن المنتجات لعملائك في جميع المناطق بأسعار منافسة وتتبع لحظي",
  },
  {
    icon: Wallet,
    title: "تحصيل أرباحك وتحويلها",
    desc: "أرباحك توصلك من غير تأخير ولا مشاكل تحصيل بعد تأكيد التسليم",
  },
];

const steps = [
  { t: "سجّل حسابك المجاني", d: "أنشئ حسابك في دقائق معدودة بدون أي رسوم" },
  { t: "اختار منتجاتك من الكتالوج", d: "تصفح أكثر من ٥٠٠٠ منتج في ٢٠ قسم" },
  { t: "انشر وسوّق على السوشيال ميديا", d: "شارك على فيسبوك وإنستغرام وتيك توك" },
  { t: "استلم أرباحك بعد التسليم", d: "نحن نتولى الشحن والتحصيل نيابة عنك" },
];

const testimonials = [
  {
    n: "سارة العتيبي",
    c: "الرياض، السعودية",
    q: "بدأت من البيت بدون رأس مال، وخلال ٣ شهور صار عندي دخل ثابت يغطي مصاريفي بالكامل.",
  },
  {
    n: "محمد الشريف",
    c: "جدة، السعودية",
    q: "أفضل شي في بايع إن الشحن والتحصيل مو شغلي. أنا بس أسوّق وأتابع الطلبات من لوحة التحكم.",
  },
  {
    n: "نورة الحربي",
    c: "الدمام، السعودية",
    q: "الكتالوج يتحدث باستمرار بمنتجات مجربة، وهامش الربح واضح قبل ما أنزل أي إعلان.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div
          className="pointer-events-none absolute -top-32 -right-24 size-[520px] rounded-full opacity-25 blur-3xl bg-brand"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 size-[380px] rounded-full opacity-20 blur-3xl bg-brand"
          aria-hidden
        />
        <div className="container-page relative grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              منصة متكاملة لتقديم حلول التجارة الإلكترونية
            </span>
            <h1 className="mt-6 text-4xl font-extrabold text-foreground md:text-5xl">
              بايع فرصتك لبداية مشروعك في{" "}
              <span className="text-brand">التجارة الإلكترونية</span> من أي مكان
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              سواء تريد بداية مشروع جديد أو توسّع تجارتك الحالية، تقدر تستفيد بخدمات بايع المتنوعة
              التي تساعدك في تحقيق أعلى مستوى من النجاح والأرباح بأقل تكلفة.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild variant="hero" size="pillLg">
                <Link to="/register">
                  ابدأ الآن مجاناً <ArrowLeft className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="pillLg">
                <Link to="/products">اعرف أكتر</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-x-6 bottom-6 top-10 rounded-full opacity-90 bg-brand" aria-hidden />
              <img
                src={heroTree}
                alt="شجرة رقمية متفرعة ترمز لتنوع التجارة الإلكترونية على منصة بايع"
                width={1024}
                height={1024}
                className="relative z-10 w-full rounded-3xl object-contain drop-shadow-xl"
              />
              <div className="absolute top-16 right-0 z-20 animate-float rounded-2xl bg-card px-4 py-3 text-sm font-bold shadow-card">
                +45,000 بائع نشط
              </div>
              <div
                className="absolute bottom-24 left-0 z-20 animate-float rounded-2xl bg-card px-4 py-3 text-sm font-bold shadow-card"
                style={{ animationDelay: "1.2s" }}
              >
                +5,000 منتج متاح
              </div>
            </div>
          </Reveal>
        </div>

        <div className="container-page relative mt-16">
          <Reveal>
            <div className="grid gap-6 rounded-3xl bg-card p-8 shadow-card sm:grid-cols-2 lg:grid-cols-4">
              {[
                { v: 45000, s: "+", l: "بائع نشط" },
                { v: 5000, s: "+", l: "منتج متاح" },
                { v: 4, s: "", l: "دول نعمل بها" },
                { v: 20, s: "+", l: "قسم متنوع" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-3xl font-extrabold text-brand">
                    <CountUp to={s.v} suffix={s.s} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              مش هنخليك تشيل الهم! <span className="text-brand">بايع هتحلها</span>
            </h2>
            <p className="mt-3 text-muted-foreground">بايع أسهل طريقة لبدء تجارتك الإلكترونية</p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <article className="card-soft h-full p-8 hover:-translate-y-2 hover:shadow-card-hover">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-brand">
                    <f.icon className="size-7 text-primary-foreground" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold">{f.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{f.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">كيف تبدأ مع بايع؟</h2>
            <p className="mt-3 text-muted-foreground">أربع خطوات بسيطة تفصلك عن أول ربح</p>
          </Reveal>

          <div className="relative mt-16 grid gap-10 md:grid-cols-4">
            <div
              className="pointer-events-none absolute top-10 right-[12%] hidden h-px w-[76%] bg-border md:block"
              aria-hidden
            />
            {steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 120} className="relative text-center">
                <span className="mx-auto flex size-20 items-center justify-center rounded-full text-2xl font-extrabold text-primary-foreground shadow-brand bg-brand">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive */}
      <section className="bg-surface py-24">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <span className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground">
              جديد بايع
            </span>
            <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">خدمة المنتجات الحصرية</h2>
            <p className="mt-4 text-muted-foreground">
              نبحث لك عن المنتجات الفريدة والمربحة حول العالم، ونتولى كل التفاصيل حتى تصل لعميلك.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                "البحث عن المنتجات الفريدة والمربحة",
                "التفاوض مع الموردين الدوليين",
                "الاستيراد والتخليص الجمركي",
                "التخزين في مستودعاتنا",
                "الشحن المباشر لعملائك",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm font-semibold">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand">
                    <Check className="size-4 text-primary-foreground" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild variant="hero" size="pill" className="mt-8">
              <Link to="/products">اكتشف المزيد</Link>
            </Button>
          </Reveal>

          <Reveal delay={150}>
            <div className="card-soft flex flex-col items-center gap-4 p-14 text-center">
              <span className="flex size-24 items-center justify-center rounded-full bg-brand">
                <Globe2 className="size-11 text-primary-foreground" />
              </span>
              <h3 className="text-2xl font-extrabold">منتجات حصرية</h3>
              <p className="text-muted-foreground">من أي مكان في العالم إلى باب عميلك</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              اختار من بين أكثر من <span className="text-brand">٢٠ قسم</span>
            </h2>
            <p className="mt-3 text-muted-foreground">منتجات مجربة بهوامش ربح واضحة قبل البيع</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c.name} delay={i * 60}>
                <Link
                  to="/products"
                  search={{ cat: c.name }}
                  className="card-soft flex h-full flex-col items-center gap-3 border border-border p-7 text-center transition-all hover:scale-[1.02] hover:border-primary"
                >
                  <span className="text-4xl">{c.emoji}</span>
                  <span className="font-bold">{c.name}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-surface py-24">
        <div className="container-page">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">الأكثر مبيعاً هذا الأسبوع</h2>
              <p className="mt-2 text-muted-foreground">منتجات مختارة بأعلى هوامش ربح</p>
            </div>
            <Button asChild variant="heroOutline" size="pill">
              <Link to="/products">كل المنتجات</Link>
            </Button>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <article className="card-soft h-full overflow-hidden hover:-translate-y-2 hover:shadow-card-hover">
                  <div className="flex h-40 items-center justify-center overflow-hidden bg-accent text-6xl">
                    <ProductImage src={p.image_url} emoji={p.emoji} alt={p.name} />
                  </div>
                  <div className="space-y-2 p-5">
                    <span className="text-xs font-bold text-primary">{p.category}</span>
                    <h3 className="line-clamp-2 font-bold">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold">{p.selling_price} ر.س</span>
                      <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">
                        ربح {profitPercent(Number(p.selling_price), Number(p.supplier_price))}%
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">آلاف البائعين يثقون في بايع</h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.n} delay={i * 100}>
                <article className="card-soft h-full p-8 hover:-translate-y-2 hover:shadow-card-hover">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-8 text-muted-foreground">«{t.q}»</p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full text-lg font-bold text-primary-foreground bg-brand">
                      {t.n.charAt(0)}
                    </span>
                    <div>
                      <p className="font-bold">{t.n}</p>
                      <p className="text-xs text-muted-foreground">{t.c}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 overflow-hidden">
            <div className="flex w-max animate-marquee gap-14 opacity-50">
              {[...Array(2)].map((_, k) => (
                <div key={k} className="flex gap-14">
                  {["أرامكو", "STC", "مدى", "Aramex", "SMSA", "Tabby", "Tamara"].map((b) => (
                    <span key={b + k} className="text-xl font-bold whitespace-nowrap">
                      {b}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24 bg-brand">
        <div
          className="pointer-events-none absolute -top-20 right-10 size-72 rounded-full bg-background/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 size-80 rounded-full bg-background/10"
          aria-hidden
        />
        <Reveal className="container-page relative text-center">
          <BadgeCheck className="mx-auto size-12 text-primary-foreground" />
          <h2 className="mt-5 text-3xl font-extrabold text-primary-foreground md:text-4xl">
            ابدأ تجارتك الإلكترونية اليوم
          </h2>
          <p className="mt-3 text-primary-foreground/90">سجل مجاناً وابدأ البيع في دقائق</p>
          <Button asChild variant="onBrand" size="pillLg" className="mt-8">
            <Link to="/register">سجل الآن</Link>
          </Button>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
