// 路线生命周期状态，后端 RoutePlanStatus 的前端镜像
export const RoutePlanStatus = ["IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type RoutePlanStatus = (typeof RoutePlanStatus)[number];

export const ACTIVE_ROUTE_PLAN_STATUS: RoutePlanStatus = "IN_PROGRESS";

export const RoutePlanStatusText: Record<RoutePlanStatus, string> = {
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};
