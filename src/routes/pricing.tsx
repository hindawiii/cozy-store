import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "الأسعار والباقات | تاجر" },
      {
        name: "description",
        content: "باقات تاجر: ابدأ مجاناً وادفع فقط عند البيع، أو اشترك في باقة النمو والأعمال.",
      },
      { property: "og:title", content: "الأسعار والباقات | تاجر" },
      { property: "og:description", content: "ابدأ مجاناً وطوّر تجارتك بباقات مرنة تناسب حجمك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "المبتدئ",
    price: "0",
    note: "مجاني للأبد",
    features: ["كتالوج كامل", "شحن وتحصيل", "تحويل أرباح أسبوعي", "دعم عبر البريد"],
    highlight: false,
  },
  {
    name: "النمو",
    price: "199",
    note: "شهرياً",
    features: [
      "كل مزايا المبتدئ",
      "أسعار جملة مخفضة",
      "تحويل أرباح يومي",
      "تقارير أداء متقدمة",
      "دعم واتساب مخصص",
    ],
    highlight: true,
  },
  {
    name: "الأعمال",
    price: "499",
    note: "شهرياً",
    features: ["كل مزايا النمو", "مدير حساب خاص", "منتجات حصرية", "علامتك على التغليف", "API للتكامل"],
    highlight: false,
  },
];

const faqs = [
  ["هل أحتاج رأس مال للبدء؟", "لا، تبدأ بدون رأس مال ولا مخزون. تدفع تكلفة المنتج بعد تحصيل قيمته."],
  ["متى تصلني أرباحي؟", "بعد تأكيد تسليم الطلب للعميل، وتُحوَّل حسب باقتك أسبوعياً أو يومياً."],
  ["هل الشحن متاح لكل المناطق؟", "نعم، نغطي جميع مناطق المملكة إضافة إلى مصر والإمارات والعراق."],
  ["هل يمكنني إلغاء الاشتراك؟", "نعم، الاشتراك شهري ويمكنك الإلغاء في أي وقت بدون رسوم."],
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container-page pt-32 pb-20 text-center">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          باقات تناسب <span className="text-brand">كل تاجر</span>
        </h1>
        <p className="mt-3 text-muted-foreground">ابدأ مجاناً وارتقِ عندما تكبر مبيعاتك</p>
      </section>

      <section className="container-page grid gap-6 pb-24 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 100}>
            <article
              className={`card-soft flex h-full flex-col p-8 ${p.highlight ? "border-2 border-primary shadow-card-hover" : "border border-border"}`}
            >
              {p.highlight && (
                <span className="mb-4 self-start rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                  الأكثر اختياراً
                </span>
              )}
              <h2 className="text-xl font-bold">{p.name}</h2>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-extrabold text-brand">{p.price}</span>
                <span className="pb-2 text-sm text-muted-foreground">ر.س / {p.note}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={p.highlight ? "hero" : "heroOutline"}
                size="pill"
                className="mt-8 w-full"
              >
                <Link to="/register">اختر الباقة</Link>
              </Button>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="bg-surface py-24">
        <div className="container-page max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-extrabold">الأسئلة الشائعة</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={q} value={`i-${i}`} className="card-soft border-none px-6">
                <AccordionTrigger className="text-right font-bold">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
