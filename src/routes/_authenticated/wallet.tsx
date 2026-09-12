import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Clock, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { sar } from "@/lib/orders";
import { withdrawalLabel, withdrawalTone, type WithdrawalStatus } from "@/lib/wallet";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "محفظة الأرباح | بايع" },
      {
        name: "description",
        content: "تابع رصيدك القابل للسحب وأرباحك المعلّقة وقدّم طلبات السحب البنكي.",
      },
      { property: "og:title", content: "محفظة الأرباح | بايع" },
      { property: "og:description", content: "رصيدك وأرباحك وطلبات السحب في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

const MIN_WITHDRAW = 100;

function WalletPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [iban, setIban] = useState("");
  const [note, setNote] = useState("");

  const ordersQ = useQuery({
    queryKey: ["wallet-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("status, profit");
      if (error) throw error;
      return data ?? [];
    },
  });

  const withdrawalsQ = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const orders = ordersQ.data ?? [];
  const earned = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + Number(o.profit ?? 0), 0);
  const pendingProfit = orders
    .filter((o) => ["pending", "confirmed", "shipped"].includes(o.status))
    .reduce((s, o) => s + Number(o.profit ?? 0), 0);
  const withdrawals = withdrawalsQ.data ?? [];
  const reserved = withdrawals
    .filter((w) => w.status !== "rejected")
    .reduce((s, w) => s + Number(w.amount), 0);
  const balance = Math.max(0, earned - reserved);

  const request = useMutation({
    mutationFn: async () => {
      const value = Number(amount);
      if (!Number.isFinite(value) || value < MIN_WITHDRAW)
        throw new Error(`أقل مبلغ للسحب ${MIN_WITHDRAW} ر.س`);
      if (value > balance) throw new Error("المبلغ أكبر من رصيدك القابل للسحب");
      if (!accountName.trim() || !iban.trim()) throw new Error("اسم صاحب الحساب والآيبان مطلوبان");
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user!.id,
        amount: value,
        method: "bank",
        account_name: accountName.trim(),
        iban: iban.trim(),
        note: note.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setAmount("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("تم إرسال طلب السحب، سيتم تحويله خلال أيام العمل");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = [
    { icon: Wallet, label: "الرصيد القابل للسحب", value: balance },
    { icon: Clock, label: "أرباح قيد التسليم", value: pendingProfit },
    { icon: Banknote, label: "إجمالي الأرباح المحققة", value: earned },
  ];

  return (
    <AppShell title="محفظة الأرباح" subtitle="أرباحك من الطلبات المسلّمة وطلبات السحب البنكي">
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((s) => (
          <article key={s.label} className="card-soft p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand">
              <s.icon className="size-5 text-primary-foreground" />
            </span>
            <div className="mt-4 text-2xl font-extrabold">{sar(s.value)}</div>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <form
          className="card-soft space-y-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            request.mutate();
          }}
        >
          <h2 className="font-bold">طلب سحب جديد</h2>
          <div className="space-y-2">
            <Label htmlFor="w-amount">المبلغ (ر.س)</Label>
            <Input
              id="w-amount"
              type="number"
              min={MIN_WITHDRAW}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12"
              required
            />
            <p className="text-xs text-muted-foreground">
              أقل مبلغ {MIN_WITHDRAW} ر.س — رصيدك الحالي {sar(balance)}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="w-name">اسم صاحب الحساب</Label>
            <Input
              id="w-name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="w-iban">رقم الآيبان</Label>
            <Input
              id="w-iban"
              dir="ltr"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="SA00 0000 0000 0000 0000 0000"
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="w-note">ملاحظة (اختياري)</Label>
            <Textarea id="w-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button
            type="submit"
            variant="hero"
            size="pill"
            className="w-full"
            disabled={request.isPending || balance < MIN_WITHDRAW}
          >
            {request.isPending ? "جاري الإرسال..." : "إرسال طلب السحب"}
          </Button>
        </form>

        <div className="card-soft overflow-x-auto p-6 lg:col-span-2">
          <h2 className="mb-4 font-bold">سجل عمليات السحب</h2>
          {withdrawals.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">لا توجد طلبات سحب بعد.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">ملاحظة الإدارة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{new Date(w.created_at).toLocaleDateString("ar-EG")}</TableCell>
                    <TableCell className="font-bold">{sar(Number(w.amount))}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${withdrawalTone[w.status as WithdrawalStatus]}`}
                      >
                        {withdrawalLabel[w.status as WithdrawalStatus]}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{w.admin_note ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
