import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { assistanceRequestRepository } from "../repositories/AssistanceRequestRepository";
import { createDeactivationImpactDto } from "../constructors/DeactivationImpactDtoFactory";
import { BusinessError } from "../errors/BusinessError";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { DISABLED_FACILITY_STATUS } from "../constants/FacilityStatus";
import { HIGH_ROUTE_RISK_LEVEL } from "../constants/RouteRiskLevel";
import { buildFacilityBlockReason } from "../constants/blockReasons";
import type {
  DeactivationImpact,
  DeactivationResult,
  DeactivatePayload
} from "../types/DeactivationImpact";

const audit = (template: string, detail: unknown) =>
  console.info("audit", template, JSON.stringify(detail));

export const accessibleFacilityService = {
  list: () => accessibleFacilityRepository.findAll(),

  create: (row: unknown) => {
    audit(LOG_TEMPLATES.AccessibleFacility[0], row);
    return accessibleFacilityRepository.save(row);
  },

  // 停用影响评估扫描：引用设施的进行中路线 + 未完成协助请求
  assessDeactivationImpact(facilityId: number): DeactivationImpact {
    const facility = accessibleFacilityRepository.findById(facilityId);
    if (!facility) {
      throw new BusinessError("FACILITY_NOT_FOUND", ERROR_MESSAGES.FACILITY_NOT_FOUND, 404);
    }
    const activeRoutes = routePlanRepository.findActiveByFacilityId(facilityId);
    const allRoutes = routePlanRepository.findByFacilityId(facilityId);
    const openRequests = assistanceRequestRepository.findOpenByFacilityId(
      facilityId,
      allRoutes.map((row) => row.id)
    );

    audit(LOG_TEMPLATES.AccessibleFacility[4], {
      facility_id: facilityId,
      active_routes: activeRoutes.length,
      open_requests: openRequests.length
    });

    return createDeactivationImpactDto(facility, activeRoutes, allRoutes, openRequests);
  },

  // 巡检员确认停用：预检不过则整次拒绝（不落任何字段），通过则一次性联动落库。
  // 重复提交（设施已停用）只返回最近一次评估结果，不再处理。
  deactivate(facilityId: number, payload: DeactivatePayload = {}, actorId?: number): DeactivationResult {
    const facility = accessibleFacilityRepository.findById(facilityId);
    if (!facility) {
      throw new BusinessError("FACILITY_NOT_FOUND", ERROR_MESSAGES.FACILITY_NOT_FOUND, 404);
    }

    // 幂等：重复提交只处理一次，设施状态、路线风险和阻塞说明保持首次处理结果
    if (facility.status === DISABLED_FACILITY_STATUS || facility.deactivated_at !== null) {
      audit(LOG_TEMPLATES.AccessibleFacility[7], {
        facility_id: facilityId,
        deactivated_at: facility.deactivated_at
      });
      return {
        facility_id: facilityId,
        status: facility.status,
        already_processed: true,
        deactivated_at: facility.deactivated_at,
        escalated_route_ids: routePlanRepository
          .findActiveByFacilityId(facilityId)
          .filter((row) => row.risk_level === HIGH_ROUTE_RISK_LEVEL && row.block_reason !== null)
          .map((row) => row.id),
        blocked_request_ids: assistanceRequestRepository
          .findAll()
          .filter((row) => row.blocked_by_facility_id === facilityId)
          .map((row) => row.id),
        impact: accessibleFacilityService.assessDeactivationImpact(facilityId)
      };
    }

    const impact = accessibleFacilityService.assessDeactivationImpact(facilityId);

    // 存在高风险进行中路线或已接单请求，缺少影响说明就整次拒绝
    const note = typeof payload.impact_note === "string" ? payload.impact_note.trim() : "";
    if (impact.impact_note_required && note.length === 0) {
      audit(LOG_TEMPLATES.AccessibleFacility[5], {
        facility_id: facilityId,
        high_risk_routes: impact.high_risk_route_count,
        accepted_requests: impact.accepted_request_count
      });
      throw new BusinessError(
        "IMPACT_NOTE_REQUIRED",
        ERROR_MESSAGES.IMPACT_NOTE_REQUIRED,
        409
      );
    }

    // 确认后一次性联动：设施停用 → 路线升高风险并写阻塞说明 → 未完成请求写阻塞原因
    const blockReason = buildFacilityBlockReason(facility.name, note);
    const deactivatedAt = new Date().toISOString();

    const updatedFacility = accessibleFacilityRepository.markDisabled(facilityId, {
      status: DISABLED_FACILITY_STATUS,
      deactivation_note: note || null,
      deactivated_at: deactivatedAt,
      deactivated_by: actorId ?? null
    });
    const escalatedRoutes = routePlanRepository.escalateRiskByFacility(
      facilityId,
      HIGH_ROUTE_RISK_LEVEL,
      blockReason
    );
    const blockedRequests = assistanceRequestRepository.blockOpenByFacility(
      facilityId,
      routePlanRepository.findByFacilityId(facilityId).map((row) => row.id),
      blockReason
    );

    audit(LOG_TEMPLATES.AccessibleFacility[6], {
      facility_id: facilityId,
      escalated_routes: escalatedRoutes.map((row) => row.id),
      blocked_requests: blockedRequests.map((row) => row.id)
    });
    audit(LOG_TEMPLATES.RoutePlan[4], { route_ids: escalatedRoutes.map((row) => row.id) });
    audit(LOG_TEMPLATES.AssistanceRequest[4], { request_ids: blockedRequests.map((row) => row.id) });

    return {
      facility_id: facilityId,
      status: updatedFacility?.status ?? DISABLED_FACILITY_STATUS,
      already_processed: false,
      deactivated_at: deactivatedAt,
      escalated_route_ids: escalatedRoutes.map((row) => row.id),
      blocked_request_ids: blockedRequests.map((row) => row.id),
      impact: accessibleFacilityService.assessDeactivationImpact(facilityId)
    };
  }
};
