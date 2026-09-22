import type { RoutePlan } from "../models/RoutePlan";
import type { AssistanceRequest } from "../models/AssistanceRequest";
import type {
  DeactivationImpact,
  ImpactAssistanceRequest,
  ImpactRoutePlan
} from "../types/DeactivationImpact";
import type { AccessibleFacility } from "../models/AccessibleFacility";
import { HIGH_RISK_LEVELS } from "../constants/RouteRiskLevel";
import { ACCEPTED_ASSISTANCE_STATUSES } from "../constants/AssistanceFlow";

export const createImpactRoutePlanDto = (
  row: RoutePlan
): ImpactRoutePlan => ({
  id: row.id,
  origin_text: row.origin_text,
  destination_text: row.destination_text,
  status: row.status,
  risk_level: row.risk_level,
  block_reason: row.block_reason,
  high_risk: (HIGH_RISK_LEVELS as readonly string[]).includes(row.risk_level)
});

export const createImpactAssistanceRequestDto = (
  row: AssistanceRequest
): ImpactAssistanceRequest => ({
  id: row.id,
  route_plan_id: row.route_plan_id,
  helper_id: row.helper_id,
  status: row.status,
  meet_point: row.meet_point,
  block_reason: row.block_reason,
  accepted:
    row.helper_id !== null &&
    (ACCEPTED_ASSISTANCE_STATUSES as readonly string[]).includes(row.status)
});

// 停用影响评估响应构造器：设施页、路线页、协助页共用同一份扫描结构
export const createDeactivationImpactDto = (
  facility: AccessibleFacility,
  activeRoutes: RoutePlan[],
  allRoutes: RoutePlan[],
  openRequests: AssistanceRequest[]
): DeactivationImpact => {
  const activeRouteDtos = activeRoutes.map(createImpactRoutePlanDto);
  const openRequestDtos = openRequests.map(createImpactAssistanceRequestDto);
  const highRiskRouteCount = activeRouteDtos.filter((row) => row.high_risk).length;
  const acceptedRequestCount = openRequestDtos.filter((row) => row.accepted).length;

  return {
    facility_id: facility.id,
    facility_name: facility.name,
    facility_status: facility.status,
    already_disabled: facility.status === "DISABLED" || facility.deactivated_at !== null,
    impact_note_required: highRiskRouteCount > 0 || acceptedRequestCount > 0,
    high_risk_route_count: highRiskRouteCount,
    accepted_request_count: acceptedRequestCount,
    open_request_count: openRequestDtos.length,
    active_routes: activeRouteDtos,
    open_requests: openRequestDtos,
    all_routes: allRoutes.map(createImpactRoutePlanDto)
  };
};
