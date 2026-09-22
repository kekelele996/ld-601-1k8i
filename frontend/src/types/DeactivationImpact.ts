import type { RoutePlan } from "./RoutePlan";
import type { AssistanceRequest } from "./AssistanceRequest";

export interface DeactivationImpact {
  facility_id: number;
  facility_name: string;
  active_routes: Array<
    Pick<RoutePlan, "id" | "origin_text" | "destination_text" | "risk_level" | "status" | "blocked_reason">
  >;
  unfinished_requests: Array<
    Pick<
      AssistanceRequest,
      "id" | "route_plan_id" | "helper_id" | "status" | "meet_point" | "blocked_reason"
    >
  >;
  high_risk_route_count: number;
  claimed_request_count: number;
  note_required: boolean;
}

export interface DeactivationResult extends DeactivationImpact {
  deactivated: boolean;
  escalated_route_ids: number[];
  blocked_request_ids: number[];
  impact_note: string | null;
  deactivated_at: string | null;
}

export interface DeactivationApiError {
  code: string;
  message: string;
  status: number;
}
