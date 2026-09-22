import { mockData } from "./seedData";
import {
  CLAIMED_ASSISTANCE_STATUS,
  DISABLED_FACILITY_STATUS,
  HIGH_RISK_LEVEL,
  UNFINISHED_ASSISTANCE_STATUS
} from "../constants/ImpactScope";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";
import type { AssistanceRequest } from "../types/AssistanceRequest";
import type { DeactivationImpact, DeactivationResult } from "../types/DeactivationImpact";

// 离线降级时在本地种子上复现后端停用影响评估逻辑，保证纯前端评审行为一致。
const facilities = mockData.accessibleFacility as unknown as AccessibleFacility[];
const routes = mockData.routePlan as unknown as RoutePlan[];
const requests = mockData.assistanceRequest as unknown as AssistanceRequest[];

export class DeactivationRejectedError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 409) {
    super(message);
    this.name = "DeactivationRejectedError";
    this.code = code;
    this.status = status;
  }
}

const getFacility = (facilityId: number): AccessibleFacility => {
  const facility = facilities.find((row) => row.id === facilityId);
  if (!facility) {
    throw new DeactivationRejectedError("FACILITY_NOT_FOUND", "设施不存在或已被移除", 404);
  }
  return facility;
};

export function scanFacilityDeactivation(facilityId: number): DeactivationImpact {
  const facility = getFacility(facilityId);
  const activeRoutes = routes.filter(
    (route) => route.status === "ACTIVE" && route.facility_ids.includes(facilityId)
  );
  const activeRouteIds = activeRoutes.map((route) => route.id);
  const unfinishedRequests = requests.filter(
    (request) =>
      activeRouteIds.includes(request.route_plan_id) &&
      UNFINISHED_ASSISTANCE_STATUS.includes(request.status as (typeof UNFINISHED_ASSISTANCE_STATUS)[number])
  );
  const highRiskRouteCount = activeRoutes.filter((route) => route.risk_level === HIGH_RISK_LEVEL).length;
  const claimedRequestCount = unfinishedRequests.filter((request) =>
    CLAIMED_ASSISTANCE_STATUS.includes(request.status as (typeof CLAIMED_ASSISTANCE_STATUS)[number])
  ).length;

  return {
    facility_id: facility.id,
    facility_name: facility.name,
    active_routes: activeRoutes.map((route) => ({
      id: route.id,
      origin_text: route.origin_text,
      destination_text: route.destination_text,
      risk_level: route.risk_level,
      status: route.status,
      blocked_reason: route.blocked_reason
    })),
    unfinished_requests: unfinishedRequests.map((request) => ({
      id: request.id,
      route_plan_id: request.route_plan_id,
      helper_id: request.helper_id,
      status: request.status,
      meet_point: request.meet_point,
      blocked_reason: request.blocked_reason
    })),
    high_risk_route_count: highRiskRouteCount,
    claimed_request_count: claimedRequestCount,
    note_required: highRiskRouteCount > 0 || claimedRequestCount > 0
  };
}

export function applyFacilityDeactivation(
  facilityId: number,
  impactNoteInput: string
): DeactivationResult {
  const facility = getFacility(facilityId);
  const impact = scanFacilityDeactivation(facilityId);

  // 重复提交只处理一次：回放上一次结果，不再升级路线或重复写阻塞原因。
  if (facility.status === DISABLED_FACILITY_STATUS) {
    return {
      ...impact,
      deactivated: false,
      escalated_route_ids: [],
      blocked_request_ids: [],
      impact_note: facility.deactivation_note,
      deactivated_at: facility.deactivated_at
    };
  }

  const impactNote = impactNoteInput.trim();
  if (impact.note_required && !impactNote) {
    throw new DeactivationRejectedError(
      "IMPACT_NOTE_REQUIRED",
      "存在高风险进行中路线或已接单协助请求，停用前必须填写影响说明",
      409
    );
  }

  const blockedReason = impactNote
    ? `设施《${facility.name}》已停用：${impactNote}`
    : `设施《${facility.name}》已停用`;
  const deactivatedAt = new Date().toISOString();

  Object.assign(facility, {
    status: DISABLED_FACILITY_STATUS,
    deactivated_at: deactivatedAt,
    deactivated_by: 1,
    deactivation_note: impactNote || null
  });

  const escalatedRouteIds: number[] = [];
  impact.active_routes.forEach((scanRoute) => {
    const route = routes.find((row) => row.id === scanRoute.id);
    if (!route) return;
    Object.assign(route, { risk_level: HIGH_RISK_LEVEL, blocked_reason: blockedReason });
    escalatedRouteIds.push(route.id);
  });

  const blockedRequestIds: number[] = [];
  impact.unfinished_requests.forEach((scanRequest) => {
    const request = requests.find((row) => row.id === scanRequest.id);
    if (!request) return;
    Object.assign(request, { blocked_reason: blockedReason, blocked_at: deactivatedAt });
    blockedRequestIds.push(request.id);
  });

  return {
    ...scanFacilityDeactivation(facilityId),
    deactivated: true,
    escalated_route_ids: escalatedRouteIds,
    blocked_request_ids: blockedRequestIds,
    impact_note: impactNote || null,
    deactivated_at: deactivatedAt
  };
}
