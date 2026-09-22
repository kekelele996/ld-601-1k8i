export const AssistanceStatus = ["REQUESTED","ACCEPTED","ARRIVED","COMPLETED","CANCELLED","BLOCKED"] as const;
export type AssistanceStatus = (typeof AssistanceStatus)[number];
export const AssistanceStatusText: Record<AssistanceStatus, string> = {
  REQUESTED: "待接单",
  ACCEPTED: "已接单",
  ARRIVED: "已到达",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  BLOCKED: "阻塞中"
};
