import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  nextStatus,
  sar,
  statusFlow,
  statusLabel,
  statusTone,
  type OrderStatus,
} from "@/lib/orders";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "تفاصيل الطلب | بايع" },
      { name: "description", content: "تابع حالة الطلب وتواصل مع فريق التشغيل حول عميلك." },
      { property: "og:title", content: "تفاصيل الطلب | بايع" },
      { property: "og:description", content: "حالة الشحن وبيانات العميل والمحادثة في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const orderQ = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, products(name, emoji, category)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const messagesQ = useQuery({
    queryKey: ["order-messages", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const advance = useMutation({
    mutationFn: async (status: OrderStatus) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("تم تحديث حالة الطلب");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const send = useMutation({
    mutationFn: async (text: string) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("order_messages").insert({
        order_id: orderId,
        sender_id: auth.user!.id,
        sender_role: "seller",
        body: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["order-messages", orderId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const order = orderQ.data;

  if (orderQ.isLoading) {
    return (
      <AppShell title="تفاصيل الطلب">
        <div className="card-soft p-16 text-center text-muted-foreground">جاري التحميل...</div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell title="تفاصيل الطلب">
        <div className="card-soft p-16 text-center">
          <p className="text-muted-foreground">هذا الطلب غير موجود.</p>
          <Button asChild variant="hero" size="pill" className="mt-6">
            <Link to="/orders">العودة للطلبات</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const status = order.status as OrderStatus;
  const next = nextStatus(status);

  return (
    <AppShell title={`الطلب #${order.order_number}`} subtitle={order.products?.name ?? ""}>
      <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
        <ArrowRight className="size-4" /> كل الطلبات
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-soft space-y-6 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge className={`rounded-full border-none ${statusTone[status]}`}>
              {statusLabel[status]}
            </Badge>
            <div className="flex gap-2">
              {next && (
                <Button variant="hero" size="pill" onClick={() => advance.mutate(next)}>
                  تحديث إلى: {statusLabel[next]}
                </Button>
              )}
              {status !== "delivered" && status !== "cancelled" && (
                <Button
                  variant="heroOutline"
                  size="pill"
                  onClick={() => advance.mutate("cancelled")}
                >
                  إلغاء الطلب
                </Button>
              )}
            </div>
          </div>

          <ol className="flex flex-wrap items-center gap-3">
            {statusFlow.map((s, i) => {
              const done = statusFlow.indexOf(status) >= i;
              return (
                <li key={s} className="flex items-center gap-2">
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold">{statusLabel[s]}</span>
                </li>
              );
            })}
          </ol>

          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="العميل" value={order.customer_name} />
            <Info label="الجوال" value={order.customer_phone} />
            <Info label="المدينة" value={order.customer_city} />
            <Info label="العنوان" value={order.customer_address || "—"} />
            <Info label="الكمية" value={String(order.quantity)} />
            <Info label="سعر البيع" value={sar(Number(order.unit_price))} />
            <Info label="سعر المورد" value={sar(Number(order.supplier_price))} />
            <Info label="ربحك" value={sar(Number(order.profit ?? 0))} />
          </div>

          {order.notes && (
            <div className="rounded-xl bg-accent p-4 text-sm">
              <span className="font-bold">ملاحظات: </span>
              {order.notes}
            </div>
          )}

          <a
            href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary"
          >
            تواصل مع العميل عبر واتساب
          </a>
        </div>

        <div className="card-soft flex h-fit flex-col p-6">
          <h2 className="mb-4 font-bold">المحادثة مع فريق التشغيل</h2>
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {(messagesQ.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                لا توجد رسائل بعد — اكتب استفسارك حول الطلب أو العميل.
              </p>
            )}
            {(messagesQ.data ?? []).map((m) => (
              <div key={m.id} className="rounded-xl bg-accent p-3 text-sm">
                <p className="mb-1 text-xs font-bold text-muted-foreground">
                  {m.sender_role === "seller" ? "أنت" : "فريق بايع"} •{" "}
                  {new Date(m.created_at).toLocaleString("ar-EG")}
                </p>
                {m.body}
              </div>
            ))}
          </div>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (body.trim()) send.mutate(body.trim());
            }}
          >
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="اكتب رسالتك..."
            />
            <Button
              type="submit"
              variant="hero"
              size="pill"
              className="w-full"
              disabled={send.isPending || !body.trim()}
            >
              <Send className="size-4" /> إرسال
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
