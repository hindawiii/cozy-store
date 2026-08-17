import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "الرئيسية", to: "/" },
  { label: "المنتجات", to: "/products" },
  { label: "الأسعار", to: "/pricing" },
  { label: "لوحة التحكم", to: "/dashboard" },
];

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/90 shadow-card backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav className="container-page flex h-20 items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-extrabold">
          <span className="text-brand">تاجر</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeProps={{ className: "text-primary" }}
                className="relative text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button asChild variant="hero" size="pill">
            <Link to="/register">ابدأ مجاناً</Link>
          </Button>
        </div>

        <button
          className="md:hidden rounded-lg p-2 text-foreground"
          aria-label="القائمة"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Menu /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col gap-2 bg-background p-6 shadow-card">
            <button
              className="mb-4 self-start rounded-lg p-2"
              aria-label="إغلاق"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Button asChild variant="hero" size="pill" className="mt-4">
              <Link to="/register" onClick={() => setOpen(false)}>
                ابدأ مجاناً
              </Link>
            </Button>
          </aside>
        </div>
      )}
    </header>
  );
}
