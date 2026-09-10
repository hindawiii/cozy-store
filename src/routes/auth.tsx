import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول وإنشاء حساب | بايع" },
      {
        name: "description",
        content: "أنشئ حساب بايع مجاناً أو سجّل دخولك بالبريد أو حساب Google وابدأ البيع فوراً.",
      },
      { property: "og:title", content: "تسجيل الدخول وإنشاء حساب | بايع" },
      { property: "og:description", content: "حساب مجاني في دقيقة واحدة وابدأ البيع بدون رأس مال." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function GoogleButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="heroOutline"
      size="pill"
      className="w-full"
      onClick={async () => {
        const res = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (res && "error" in res && res.error) toast.error("تعذر تسجيل الدخول عبر Google");
      }}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          fill="currentColor"
          d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.63 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.28 12 6.28c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.72 14.55 2.8 12 2.8 6.98 2.8 2.9 6.88 2.9 11.9S6.98 21 12 21c5.24 0 8.7-3.68 8.7-8.86 0-.6-.06-1.05-.35-1.04Z"
        />
      </svg>
      {label}
    </Button>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const email = String(f.get("email"));
    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(f.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: String(f.get("name")), phone: String(f.get("phone")) },
      },
    });
    if (error) {
      setBusy(false);
      toast.error(
        error.message.includes("already registered")
          ? "هذا البريد مسجل مسبقاً، سجّل الدخول"
          : error.message,
      );
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: String(f.get("name")),
        phone: String(f.get("phone")),
        store_name: String(f.get("store") || ""),
      });
    }
    setBusy(false);
    toast.success("تم إنشاء حسابك بنجاح، أهلاً بك في بايع!");
    navigate({ to: "/dashboard" });
  };

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
      return;
    }
    toast.success("أهلاً بعودتك!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container-page grid items-center gap-12 pt-32 pb-24 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            انضم لأكثر من <span className="text-brand">45,000</span> بائع
          </h1>
          <p className="mt-4 text-muted-foreground">
            التسجيل مجاني بالكامل، ولا تحتاج رأس مال ولا مخزون للبدء.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "كتالوج منتجات جاهز للبيع",
              "شحن وتحصيل في جميع المناطق",
              "تحويل الأرباح بعد التسليم",
              "لوحة تحكم لمتابعة الطلبات والمحادثات",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 font-semibold">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand">
                  <Check className="size-4 text-primary-foreground" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-soft p-8">
          <Tabs defaultValue="signup">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">حساب جديد</TabsTrigger>
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <form className="space-y-4 pt-6" onSubmit={signUp}>
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" name="name" required placeholder="محمد العبدالله" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store">اسم المتجر</Label>
                  <Input id="store" name="store" placeholder="متجر النخبة" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input id="phone" name="phone" required placeholder="05xxxxxxxx" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" name="email" type="email" required placeholder="you@mail.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="8 أحرف على الأقل"
                    className="h-12"
                  />
                </div>
                <Button type="submit" variant="hero" size="pill" disabled={busy} className="w-full">
                  {busy ? "جاري الإنشاء..." : "أنشئ حسابي مجاناً"}
                </Button>
                <GoogleButton label="التسجيل عبر Google" />
                <p className="text-center text-xs text-muted-foreground">
                  بالتسجيل أنت توافق على الشروط والأحكام وسياسة الخصوصية
                </p>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form className="space-y-4 pt-6" onSubmit={signIn}>
                <div className="space-y-2">
                  <Label htmlFor="lemail">البريد الإلكتروني</Label>
                  <Input id="lemail" name="email" type="email" required placeholder="you@mail.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lpass">كلمة المرور</Label>
                  <Input id="lpass" name="password" type="password" required placeholder="••••••••" className="h-12" />
                </div>
                <Button type="submit" variant="hero" size="pill" disabled={busy} className="w-full">
                  {busy ? "جاري الدخول..." : "تسجيل الدخول"}
                </Button>
                <Link
                  to="/forgot-password"
                  className="block text-center text-sm font-bold text-primary"
                >
                  نسيت كلمة المرور؟
                </Link>
                <GoogleButton label="الدخول عبر Google" />
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
