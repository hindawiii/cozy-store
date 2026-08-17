import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب | تاجر" },
      {
        name: "description",
        content: "أنشئ حساب تاجر مجاناً في دقائق وابدأ البيع بدون رأس مال أو مخزون.",
      },
      { property: "og:title", content: "إنشاء حساب | تاجر" },
      { property: "og:description", content: "سجّل مجاناً وابدأ البيع خلال دقائق مع منصة تاجر." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent, msg: string) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(msg);
    }, 900);
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
              "كتالوج بأكثر من 5000 منتج",
              "شحن وتحصيل في جميع المناطق",
              "تحويل الأرباح بعد التسليم",
              "لوحة تحكم لمتابعة الطلبات",
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
              <form className="space-y-4 pt-6" onSubmit={(e) => submit(e, "تم إنشاء حسابك بنجاح!")}>
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input id="name" required placeholder="محمد العبدالله" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input id="phone" required placeholder="05xxxxxxxx" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" required placeholder="you@mail.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass">كلمة المرور</Label>
                  <Input id="pass" type="password" required placeholder="••••••••" className="h-12" />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="pill"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "جاري الإنشاء..." : "أنشئ حسابي مجاناً"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  بالتسجيل أنت توافق على الشروط والأحكام وسياسة الخصوصية
                </p>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form className="space-y-4 pt-6" onSubmit={(e) => submit(e, "أهلاً بعودتك!")}>
                <div className="space-y-2">
                  <Label htmlFor="lemail">البريد الإلكتروني</Label>
                  <Input id="lemail" type="email" required placeholder="you@mail.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lpass">كلمة المرور</Label>
                  <Input id="lpass" type="password" required placeholder="••••••••" className="h-12" />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="pill"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/dashboard" className="font-bold text-primary">
                    اذهب للوحة التحكم
                  </Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
