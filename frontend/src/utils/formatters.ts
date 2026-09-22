import { FacilityStatusTextZh } from "../constants/FacilityStatus";
import { RoutePlanStatusText } from "../constants/RoutePlanStatus";
import { AssistanceStatusTextZh } from "../constants/AssistanceStatus";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

// 设施状态中文文案（停用影响评估新增 DISABLED 后所有页面统一走这里）
export const formatFacilityStatus = (value: string) =>
  (FacilityStatusTextZh as Record<string, string>)[value] ?? formatStatus(value);

// 路线生命周期状态
export const formatRouteStatus = (value: string) =>
  (RoutePlanStatusText as Record<string, string>)[value] ?? formatStatus(value);

// 协助请求状态（停用只写阻塞原因，不改此状态）
export const formatAssistanceStatus = (value: string) =>
  (AssistanceStatusTextZh as Record<string, string>)[value] ?? formatStatus(value);

// 阻塞说明缺省文案
export const formatBlockReason = (value: string | null) =>
  value && value.trim().length > 0 ? value : "—";
