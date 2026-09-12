export type WithdrawalStatus = "pending" | "approved" | "paid" | "rejected";

export const withdrawalLabel: Record<WithdrawalStatus, string> = {
  pending: "قيد المراجعة",
  approved: "تمت الموافقة",
  paid: "تم التحويل",
  rejected: "مرفوض",
};

export const withdrawalTone: Record<WithdrawalStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-accent text-accent-foreground",
  paid: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};
