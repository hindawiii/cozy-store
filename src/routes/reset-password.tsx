import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "تعيين كلمة مرور جديدة | بايع" },
      {
        name: "description",
        content: "اختر كلمة مرور جديدة لحسابك في بايع وأكمل الدخول إلى لوحة التحكم.",
      },
      { property: "og:title", content: "تعيين كلمة مرور جديدة | بايع" },
      { property: "og:description", content: "خطوة أخيرة لاستعادة حسابك في بايع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("تعذر تحديث كلمة المرور، اطلب رابطاً جديداً");
      return;
    }
    toast.success("تم تحديث كلمة المرور");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <section className="container-page flex justify-center pt-32 pb-24">
        <div className="card-soft w-full max-w-md p-8">
          <h1 className="text-2xl font-extrabold">كلمة مرور جديدة</h1>
          {!ready ? (
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              افتح هذه الصفحة من الرابط الذي وصلك على بريدك الإلكتروني حتى تتمكن من تغيير كلمة
              المرور.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  className="h-12"
                />
              </div>
              <Button type="submit" variant="hero" size="pill" disabled={busy} className="w-full">
                {busy ? "جاري الحفظ..." : "حفظ كلمة المرور"}
              </Button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
