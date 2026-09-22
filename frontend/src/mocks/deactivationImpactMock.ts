import { mockData } from "./seedData";
import type { DeactivationImpact } from "../types/DeactivationImpact";

// 离线评审兜底：按与后端 assessDeactivationImpact 相同的规则从 mock 数据推导扫描结果
export function buildMockDeactivationImpact(facilityId: number): DeactivationImpact {
  const facility = mockData.accessibleFacility.find((row) => row.id === facilityId);
  const allRoutes = mockData.routePlan
    .filter((row) => row.facility_ids.includes(facilityId))
    .map((row) => ({
      id: row.id,
      origin_text: row.origin_text,
      destination_text: row.destination_text,
      status: row.status,
      risk_level: row.risk_level,
      block_reason: row.block_reason,
      high_risk: row.risk_level === "HIGH"
    }));
  const activeRoutes = allRoutes.filter((row) => row.status === "IN_PROGRESS");
  const routeIds = new Set(allRoutes.map((row) => row.id));
  const openRequests = mockData.assistanceRequest
    .filter((row) => routeIds.has(row.route_plan_id) &&
      ["REQUESTED", "ACCEPTED", "ARRIVED"].includes(row.status))
    .map((row) => ({
      id: row.id,
      route_plan_id: row.route_plan_id,
      helper_id: row.helper_id,
      status: row.status,
      meet_point: row.meet_point,
      block_reason: row.block_reason,
      accepted: row.helper_id !== null && ["ACCEPTED", "ARRIVED"].includes(row.status)
    }));
  const highRiskRouteCount = activeRoutes.filter((row) => row.high_risk).length;
  const acceptedRequestCount = openRequests.filter((row) => row.accepted).length;

  return {
    facility_id: facilityId,
    facility_name: facility?.name ?? `设施 ${facilityId}`,
    facility_status: facility?.status ?? "UNKNOWN",
    already_disabled: facility?.status === "DISABLED" || facility?.deactivated_at !== null,
    impact_note_required: highRiskRouteCount > 0 || acceptedRequestCount > 0,
    high_risk_route_count: highRiskRouteCount,
    accepted_request_count: acceptedRequestCount,
    open_request_count: openRequests.length,
    active_routes: activeRoutes,
    open_requests: openRequests,
    all_routes: allRoutes
  };
}
