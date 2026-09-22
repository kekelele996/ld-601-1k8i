export const RouteStatus = ["ACTIVE","FINISHED","CANCELLED"] as const;
export type RouteStatus = (typeof RouteStatus)[number];
export const RouteStatusText: Record<RouteStatus, string> = {
  ACTIVE: "进行中",
  FINISHED: "已完成",
  CANCELLED: "已取消"
};

// 未完成协助请求：待接单、已接单、志愿者已到达
export const UNFINISHED_ASSISTANCE_STATUS = ["REQUESTED", "ACCEPTED", "ARRIVED"] as const;
// 已接单请求：停用设施时必须保留接单关系
export const CLAIMED_ASSISTANCE_STATUS = ["ACCEPTED", "ARRIVED"] as const;
export const HIGH_RISK_LEVEL = "HIGH";
export const DISABLED_FACILITY_STATUS = "DISABLED";
