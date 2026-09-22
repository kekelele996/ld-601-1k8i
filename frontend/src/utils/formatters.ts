import { FacilityStatusText } from "../constants/FacilityStatus";
import { AssistanceStatusText } from "../constants/AssistanceStatus";
import { RouteStatusText } from "../constants/ImpactScope";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const formatFacilityStatus = (value: string): string =>
  (FacilityStatusText as Record<string, string>)[value] ?? formatStatus(value);

export const formatAssistanceStatus = (value: string): string =>
  (AssistanceStatusText as Record<string, string>)[value] ?? formatStatus(value);

export const formatRouteStatus = (value: string): string =>
  (RouteStatusText as Record<string, string>)[value] ?? formatStatus(value);
