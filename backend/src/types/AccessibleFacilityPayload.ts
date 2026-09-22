export interface FacilityDeactivationPayload {
  impact_note?: string;
  operator_id?: number;
  confirm?: boolean;
}

export interface ImpactScanRoute {
  id: number;
  origin_text: string;
  destination_text: string;
  risk_level: string;
  status: string;
  blocked_reason: string | null;
}

export interface ImpactScanRequest {
  id: number;
  route_plan_id: number;
  helper_id: number | null;
  status: string;
  meet_point: string;
  blocked_reason: string | null;
}

export interface DeactivationImpact {
  facility_id: number;
  facility_name: string;
  active_routes: ImpactScanRoute[];
  unfinished_requests: ImpactScanRequest[];
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

export type AccessibleFacilityPayload = Record<string, unknown>;
