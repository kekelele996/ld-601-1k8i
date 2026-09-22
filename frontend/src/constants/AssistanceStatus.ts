export const AssistanceStatus = ["REQUESTED", "ACCEPTED", "ARRIVED", "COMPLETED", "CANCELLED"] as const;
export type AssistanceStatus = (typeof AssistanceStatus)[number];
export const AssistanceStatusText: Record<AssistanceStatus, string> = Object.fromEntries(AssistanceStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<AssistanceStatus, string>;

// 协助调度页中文状态文案（停用阻塞时仍保留 REQUESTED/ACCEPTED 等原状态）
export const AssistanceStatusTextZh: Record<AssistanceStatus, string> = {
  REQUESTED: "待接单",
  ACCEPTED: "已接单",
  ARRIVED: "已到达",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};
