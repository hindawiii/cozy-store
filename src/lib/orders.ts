export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled";

export const statusLabel: Record<OrderStatus, string> = {
  pending: "قيد المراجعة",
  confirmed: "تم التأكيد",
  shipped: "قيد الشحن",
  delivered: "تم التسليم",
  returned: "مرتجع",
  cancelled: "ملغي",
};

export const statusTone: Record<OrderStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  shipped: "bg-accent text-accent-foreground",
  delivered: "bg-success text-success-foreground",
  returned: "bg-destructive text-destructive-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export const statusFlow: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

export const nextStatus = (s: OrderStatus): OrderStatus | null => {
  const i = statusFlow.indexOf(s);
  if (i === -1 || i === statusFlow.length - 1) return null;
  return statusFlow[i + 1] ?? null;
};

export const sar = (n: number) => `${Number(n).toLocaleString("ar-EG")} ر.س`;

export const profitPercent = (selling: number, supplier: number) =>
  selling > 0 ? Math.round(((selling - supplier) / selling) * 100) : 0;
