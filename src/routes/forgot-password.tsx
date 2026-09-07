import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "استعادة كلمة المرور | بايع" },
      {
        name: "description",
        content: "أرسل رابط إعادة تعيين كلمة المرور إلى بريدك واستعد الدخول إلى حساب بايع.",
      },
      { property: "og:title", content: "استعادة كلمة المرور | بايع" },
      { property: "og:description", content: "رابط إعادة تعيين كلمة المرور يصلك على بريدك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error("تعذر إرسال الرابط، حاول مرة أخرى");
      return;
    }
    setSent(true);
    toast.success("أرسلنا لك رابط إعادة التعيين");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <section className="container-page flex justify-center pt-32 pb-24">
        <div className="card-soft w-full max-w-md p-8">
          <h1 className="text-2xl font-extrabold">نسيت كلمة المرور؟</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            اكتب بريدك المسجّل وسنرسل لك رابطاً لإنشاء كلمة مرور جديدة.
          </p>
          {sent ? (
            <div className="mt-6 space-y-4 text-sm">
              <p className="rounded-xl bg-accent p-4 leading-7">
                تحقق من بريدك الإلكتروني، الرابط صالح لفترة محدودة. لا تنسَ مجلد الرسائل غير
                المرغوبة.
              </p>
              <Link to="/auth" className="font-bold text-primary">
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@mail.com"
                  className="h-12"
                />
              </div>
              <Button type="submit" variant="hero" size="pill" disabled={busy} className="w-full">
                {busy ? "جاري الإرسال..." : "أرسل رابط الاستعادة"}
              </Button>
              <Link to="/auth" className="block text-center text-sm text-muted-foreground">
                العودة لتسجيل الدخول
              </Link>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
