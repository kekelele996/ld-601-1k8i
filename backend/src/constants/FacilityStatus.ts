export const FacilityStatus = ["AVAILABLE", "BLOCKED", "MAINTENANCE", "DISABLED", "UNKNOWN"] as const;
export type FacilityStatus = (typeof FacilityStatus)[number];

// 停用影响评估通过后设施写入的状态
export const DISABLED_FACILITY_STATUS: FacilityStatus = "DISABLED";
