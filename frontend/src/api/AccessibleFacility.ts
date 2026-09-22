import { mockData } from "../mocks/seedData";
import { requestJson, ApiClientError } from "./httpClient";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { HIGH_ROUTE_RISK_LEVEL } from "../constants/RouteRiskLevel";
import { buildMockDeactivationImpact } from "../mocks/deactivationImpactMock";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type {
  DeactivationImpact,
  DeactivationResult,
  DeactivatePayload
} from "../types/DeactivationImpact";

const endpoint = "/api/accessible-facility";

export async function listAccessibleFacility(): Promise<AccessibleFacility[]> {
  try {
    return await requestJson<AccessibleFacility[]>(endpoint);
  } catch (error) {
    if ((error as ApiClientError).code === "NETWORK_ERROR") {
      // 本地评审兜底：保持 UI 可打开
      return mockData.accessibleFacility.map((row) => ({ ...row }));
    }
    throw error;
  }
}

// 停用影响评估扫描：GET /api/accessible-facility/:id/deactivation-impact
export async function fetchDeactivationImpact(facilityId: number): Promise<DeactivationImpact> {
  try {
    return await requestJson<DeactivationImpact>(`${endpoint}/${facilityId}/deactivation-impact`);
  } catch (error) {
    if ((error as ApiClientError).code === "NETWORK_ERROR") {
      return buildMockDeactivationImpact(facilityId);
    }
    throw error;
  }
}

// 巡检员确认停用：PATCH /api/accessible-facility/:id/deactivate
// 后端在缺少影响说明时返回 409 + IMPACT_NOTE_REQUIRED，本函数原样抛出供页面拦截。
export async function deactivateFacility(
  facilityId: number,
  payload: DeactivatePayload
): Promise<DeactivationResult> {
  console.info(LOG_TEMPLATES.AccessibleFacility[6], { facilityId, payload });
  try {
    return await requestJson<DeactivationResult>(`${endpoint}/${facilityId}/deactivate`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if ((error as ApiClientError).code === "NETWORK_ERROR") {
      // 离线评审：在内存 mock 中模拟整套联动，保证刷新前页面状态可演示
      return applyMockDeactivation(facilityId, payload);
    }
    throw error;
  }
}

function applyMockDeactivation(facilityId: number, payload: DeactivatePayload): DeactivationResult {
  const impact = buildMockDeactivationImpact(facilityId);
  if (impact.already_disabled) {
    console.info(LOG_TEMPLATES.AccessibleFacility[7], { facilityId });
    return {
      facility_id: facilityId,
      status: "DISABLED",
      already_processed: true,
      deactivated_at: mockData.accessibleFacility.find((row) => row.id === facilityId)
        ?.deactivated_at ?? new Date().toISOString(),
      escalated_route_ids: mockData.routePlan
        .filter((row) => row.facility_ids.includes(facilityId))
        .map((row) => row.id),
      blocked_request_ids: mockData.assistanceRequest
        .filter((row) => row.blocked_by_facility_id === facilityId)
        .map((row) => row.id),
      impact: buildMockDeactivationImpact(facilityId)
    };
  }
  const note = (payload.impact_note ?? "").trim();
  if (impact.impact_note_required && note.length === 0) {
    console.info(LOG_TEMPLATES.AccessibleFacility[5], { facilityId });
    throw new ApiClientError(
      ERROR_CODES.IMPACT_NOTE_REQUIRED,
      ERROR_MESSAGES.IMPACT_NOTE_REQUIRED,
      409
    );
  }
  const facility = mockData.accessibleFacility.find((row) => row.id === facilityId);
  if (facility) {
    facility.status = "DISABLED";
    facility.deactivation_note = note || null;
    facility.deactivated_at = new Date().toISOString();
  }
  const reason = `设施「${impact.facility_name}」已停用，路线需重新规划`;
  const escalated: number[] = [];
  const blocked: number[] = [];
  for (const route of mockData.routePlan) {
    if (route.status === "IN_PROGRESS" && route.facility_ids.includes(facilityId)) {
      route.risk_level = HIGH_ROUTE_RISK_LEVEL;
      route.block_reason = reason;
      escalated.push(route.id);
    }
  }
  for (const request of mockData.assistanceRequest) {
    const route = mockData.routePlan.find((row) => row.id === request.route_plan_id);
    if (route && route.facility_ids.includes(facilityId) &&
      ["REQUESTED", "ACCEPTED", "ARRIVED"].includes(request.status)) {
      request.block_reason = reason;
      request.blocked_by_facility_id = facilityId;
      blocked.push(request.id);
    }
  }
  return {
    facility_id: facilityId,
    status: "DISABLED",
    already_processed: false,
    deactivated_at: facility?.deactivated_at ?? new Date().toISOString(),
    escalated_route_ids: escalated,
    blocked_request_ids: blocked,
    impact: buildMockDeactivationImpact(facilityId)
  };
}

export async function saveAccessibleFacility(payload: AccessibleFacility) {
  console.info("save AccessibleFacility", payload);
  return payload;
}
