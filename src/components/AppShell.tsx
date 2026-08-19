import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Package, ShoppingBag, Store } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

const tabs = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/orders", label: "الطلبات", icon: ShoppingBag },
  { to: "/my-store", label: "منتجاتي", icon: Store },
  { to: "/products", label: "الكتالوج", icon: Package },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <SiteNavbar />
      <section className="container-page pt-32 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">{user?.email}</span>
            <Button variant="heroOutline" size="pill" onClick={() => signOut()}>
              <LogOut className="size-4" /> خروج
            </Button>
          </div>
        </div>

        <nav className="card-soft mt-8 flex flex-wrap gap-2 p-2">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeProps={{ className: "bg-brand text-primary-foreground" }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <t.icon className="size-4" />
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8">{children}</div>
      </section>
      <SiteFooter />
    </div>
  );
}
