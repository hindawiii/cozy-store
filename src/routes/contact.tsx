import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | بايع" },
      {
        name: "description",
        content: "قنوات التواصل مع فريق بايع: واتساب، بريد إلكتروني، ودعم البائعين طوال أيام الأسبوع.",
      },
      { property: "og:title", content: "تواصل معنا | بايع" },
      { property: "og:description", content: "فريق دعم بايع جاهز لمساعدتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: MessageCircle,
    title: "واتساب الدعم",
    value: "+966 55 000 0000",
    href: "https://wa.me/966550000000",
  },
  { icon: Mail, title: "البريد الإلكتروني", value: "support@bayie.sa", href: "mailto:support@bayie.sa" },
  { icon: Phone, title: "الهاتف", value: "+966 11 000 0000", href: "tel:+966110000000" },
];

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <section className="container-page max-w-3xl pt-32 pb-24">
        <h1 className="text-3xl font-extrabold md:text-4xl">تواصل معنا</h1>
        <p className="mt-3 text-muted-foreground">
          فريق بايع متاح من الأحد إلى الخميس، 9 صباحاً حتى 6 مساءً.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="card-soft flex flex-col items-center gap-3 p-6 text-center transition-transform hover:-translate-y-1"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent">
                <c.icon className="size-5 text-primary" />
              </span>
              <span className="font-bold">{c.title}</span>
              <span dir="ltr" className="text-sm text-muted-foreground">
                {c.value}
              </span>
            </a>
          ))}
        </div>
        <p className="mt-8 text-sm leading-8 text-muted-foreground">
          هذه بيانات تجريبية أضفناها كنموذج — أرسل لنا رقم الواتساب والبريد الحقيقيين لتحديثها.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
