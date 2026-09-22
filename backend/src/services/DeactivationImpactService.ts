import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { assistanceRequestRepository } from "../repositories/AssistanceRequestRepository";
import { throwServiceError } from "../utils/serviceError";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import {
  CLAIMED_ASSISTANCE_STATUS,
  HIGH_RISK_LEVEL,
  IN_PROGRESS_ROUTE_STATUS,
  UNFINISHED_ASSISTANCE_STATUS
} from "../constants/ImpactScope";
import type { AccessibleFacility } from "../models/AccessibleFacility";
import type {
  DeactivationImpact,
  DeactivationResult,
  ImpactScanRequest,
  ImpactScanRoute
} from "../types/AccessibleFacilityPayload";

const toRouteView = (row: {
  id: number;
  origin_text: string;
  destination_text: string;
  risk_level: string;
  status: string;
  blocked_reason: string | null;
}): ImpactScanRoute => ({
  id: row.id,
  origin_text: row.origin_text,
  destination_text: row.destination_text,
  risk_level: row.risk_level,
  status: row.status,
  blocked_reason: row.blocked_reason
});

const toRequestView = (row: {
  id: number;
  route_plan_id: number;
  helper_id: number | null;
  status: string;
  meet_point: string;
  blocked_reason: string | null;
}): ImpactScanRequest => ({
  id: row.id,
  route_plan_id: row.route_plan_id,
  helper_id: row.helper_id,
  status: row.status,
  meet_point: row.meet_point,
  blocked_reason: row.blocked_reason
});

export const deactivationImpactService = {
  requireFacility(facilityId: number): AccessibleFacility {
    const facility = accessibleFacilityRepository.findById(facilityId);
    if (!facility) {
      throwServiceError("FACILITY_NOT_FOUND", `facility ${facilityId} not found`, 404);
    }
    return facility as AccessibleFacility;
  },

  scan(facilityId: number): DeactivationImpact {
    const facility = this.requireFacility(facilityId);
    const activeRoutes = routePlanRepository
      .findByFacilityId(facilityId)
      .filter((route) => route.status === IN_PROGRESS_ROUTE_STATUS);
    const activeRouteIds = activeRoutes.map((route) => route.id);
    const unfinishedRequests = assistanceRequestRepository
      .findByRoutePlanIds(activeRouteIds)
      .filter((request) =>
        UNFINISHED_ASSISTANCE_STATUS.includes(request.status as (typeof UNFINISHED_ASSISTANCE_STATUS)[number])
      );

    const impact: DeactivationImpact = {
      facility_id: facility.id,
      facility_name: facility.name,
      active_routes: activeRoutes.map(toRouteView),
      unfinished_requests: unfinishedRequests.map(toRequestView),
      high_risk_route_count: 0,
      claimed_request_count: 0,
      note_required: false
    };
    const highRiskRouteCount = impact.active_routes.filter(
      (route) => route.risk_level === HIGH_RISK_LEVEL
    ).length;
    const claimedRequestCount = impact.unfinished_requests.filter((request) =>
      CLAIMED_ASSISTANCE_STATUS.includes(request.status as (typeof CLAIMED_ASSISTANCE_STATUS)[number])
    ).length;
    impact.high_risk_route_count = highRiskRouteCount;
    impact.claimed_request_count = claimedRequestCount;
    impact.note_required = highRiskRouteCount > 0 || claimedRequestCount > 0;

    console.info(LOG_TEMPLATES.AccessibleFacility[4], toAuditTarget("AccessibleFacility", facilityId), {
      activeRoutes: impact.active_routes.length,
      unfinishedRequests: impact.unfinished_requests.length,
      noteRequired: impact.note_required
    });
    return impact;
  },

  deactivate(facilityId: number, impactNoteInput: unknown, operatorId = 1): DeactivationResult {
    const facility = this.requireFacility(facilityId);
    const impact = this.scan(facilityId);

    // 重复提交：设施已停用只处理一次，直接回放上一次影响结果，不再升级路线或重复写阻塞原因。
    if (facility.status === "DISABLED") {
      console.info(LOG_TEMPLATES.AccessibleFacility[5], toAuditTarget("AccessibleFacility", facilityId), "already deactivated, skipped");
      return {
        ...impact,
        deactivated: false,
        escalated_route_ids: [],
        blocked_request_ids: [],
        impact_note: facility.deactivation_note,
        deactivated_at: facility.deactivated_at
      };
    }

    const impactNote = typeof impactNoteInput === "string" ? impactNoteInput.trim() : "";
    if (impact.note_required && !impactNote) {
      console.info(LOG_TEMPLATES.AccessibleFacility[6], toAuditTarget("AccessibleFacility", facilityId), "rejected: missing impact note");
      throwServiceError(
        "IMPACT_NOTE_REQUIRED",
        "存在高风险进行中路线或已接单协助请求，停用前必须填写影响说明",
        409
      );
    }

    const blockedReason = impactNote
      ? `设施《${facility.name}》已停用：${impactNote}`
      : `设施《${facility.name}》已停用`;
    const deactivatedAt = new Date().toISOString();

    // 设施标为停用，留下影响说明与操作人。
    accessibleFacilityRepository.update(facilityId, {
      status: "DISABLED",
      deactivated_at: deactivatedAt,
      deactivated_by: operatorId,
      deactivation_note: impactNote || null
    });

    // 相关进行中路线一律升为高风险，并保留阻塞说明；路线本身不因停用而关闭。
    const escalatedRouteIds: number[] = [];
    impact.active_routes.forEach((route) => {
      routePlanRepository.update(route.id, {
        risk_level: HIGH_RISK_LEVEL,
        blocked_reason: blockedReason
      });
      escalatedRouteIds.push(route.id);
    });

    // 未完成请求写入阻塞原因，helper_id 接单关系原样保留，状态不变。
    const blockedRequestIds: number[] = [];
    impact.unfinished_requests.forEach((request) => {
      assistanceRequestRepository.update(request.id, {
        blocked_reason: blockedReason,
        blocked_at: deactivatedAt
      });
      blockedRequestIds.push(request.id);
    });

    console.info(LOG_TEMPLATES.AccessibleFacility[5], toAuditTarget("AccessibleFacility", facilityId), {
      escalatedRoutes: escalatedRouteIds,
      blockedRequests: blockedRequestIds
    });
    escalatedRouteIds.forEach((id) =>
      console.info(LOG_TEMPLATES.RoutePlan[4], toAuditTarget("RoutePlan", id), HIGH_RISK_LEVEL)
    );
    blockedRequestIds.forEach((id) =>
      console.info(LOG_TEMPLATES.AssistanceRequest[4], toAuditTarget("AssistanceRequest", id))
    );

    return {
      ...this.scan(facilityId),
      deactivated: true,
      escalated_route_ids: escalatedRouteIds,
      blocked_request_ids: blockedRequestIds,
      impact_note: impactNote || null,
      deactivated_at: deactivatedAt
    };
  }
};
