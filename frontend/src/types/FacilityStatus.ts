export const FacilityStatus = ["AVAILABLE","BLOCKED","MAINTENANCE","UNKNOWN","DISABLED"] as const;
export type FacilityStatus = (typeof FacilityStatus)[number];
export const FacilityStatusText: Record<FacilityStatus, string> = {
  AVAILABLE: "可用",
  BLOCKED: "受阻滞用",
  MAINTENANCE: "维护中",
  UNKNOWN: "未知",
  DISABLED: "已停用"
};
