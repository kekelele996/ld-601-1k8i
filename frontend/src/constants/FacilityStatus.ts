export const FacilityStatus = ["AVAILABLE", "BLOCKED", "MAINTENANCE", "DISABLED", "UNKNOWN"] as const;
export type FacilityStatus = (typeof FacilityStatus)[number];

// 停用影响评估通过后写入的状态
export const DISABLED_FACILITY_STATUS: FacilityStatus = "DISABLED";

const defaultText = (value: string) => value.replace(/_/g, " ");
export const FacilityStatusText: Record<FacilityStatus, string> = Object.fromEntries(
  FacilityStatus.map((value) => [value, defaultText(value)])
) as Record<FacilityStatus, string>;

// 中文展示文案（筛选器 / StatusBadge / 设施页共用）
export const FacilityStatusTextZh: Record<FacilityStatus, string> = {
  AVAILABLE: "可用",
  BLOCKED: "受阻",
  MAINTENANCE: "维护中",
  DISABLED: "已停用",
  UNKNOWN: "未知"
};
