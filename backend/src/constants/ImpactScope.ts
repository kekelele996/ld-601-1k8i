export const RiskLevel = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RiskLevel)[number];

export const HIGH_RISK_LEVEL: RiskLevel = "HIGH";

export const RouteStatus = ["ACTIVE", "FINISHED", "CANCELLED"] as const;
export type RouteStatus = (typeof RouteStatus)[number];
export const IN_PROGRESS_ROUTE_STATUS: RouteStatus = "ACTIVE";

// 未完成协助请求：待接单、已接单、志愿者已到达
export const UNFINISHED_ASSISTANCE_STATUS = ["REQUESTED", "ACCEPTED", "ARRIVED"] as const;
export type UnfinishedAssistanceStatus = (typeof UNFINISHED_ASSISTANCE_STATUS)[number];

// 已接单请求：必须保留接单关系并写入阻塞原因
export const CLAIMED_ASSISTANCE_STATUS = ["ACCEPTED", "ARRIVED"] as const;
export type ClaimedAssistanceStatus = (typeof CLAIMED_ASSISTANCE_STATUS)[number];
