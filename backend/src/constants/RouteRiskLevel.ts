// 路线风险等级，设施停用后受影响路线统一升至高风险
export const RouteRiskLevel = ["LOW", "MEDIUM", "HIGH"] as const;
export type RouteRiskLevel = (typeof RouteRiskLevel)[number];

export const HIGH_ROUTE_RISK_LEVEL: RouteRiskLevel = "HIGH";
export const HIGH_RISK_LEVELS: RouteRiskLevel[] = ["HIGH"];
