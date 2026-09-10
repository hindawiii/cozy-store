import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <section className="container-page max-w-3xl pt-32 pb-24">
        <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{intro}</p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <article key={s.h} className="card-soft p-6">
              <h2 className="text-lg font-bold">{s.h}</h2>
              <p className="mt-3 text-sm leading-8 text-muted-foreground">{s.p}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          آخر تحديث: 2026 — لأي استفسار تواصل معنا عبر صفحة "تواصل معنا".
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
