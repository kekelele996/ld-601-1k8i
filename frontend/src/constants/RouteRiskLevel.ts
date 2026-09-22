// 路线风险等级，前端镜像
export const RouteRiskLevel = ["LOW", "MEDIUM", "HIGH"] as const;
export type RouteRiskLevel = (typeof RouteRiskLevel)[number];

export const HIGH_ROUTE_RISK_LEVEL: RouteRiskLevel = "HIGH";
