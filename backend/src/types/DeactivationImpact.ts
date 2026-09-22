// 停用影响评估扫描结果：GET /api/accessible-facility/:id/deactivation-impact
export interface ImpactRoutePlan {
  id: number;
  origin_text: string;
  destination_text: string;
  status: string;
  risk_level: string;
  block_reason: string | null;
  high_risk: boolean;
}

export interface ImpactAssistanceRequest {
  id: number;
  route_plan_id: number;
  helper_id: number | null;
  status: string;
  meet_point: string;
  block_reason: string | null;
  accepted: boolean;
}

export interface DeactivationImpact {
  facility_id: number;
  facility_name: string;
  facility_status: string;
  already_disabled: boolean;
  impact_note_required: boolean;
  high_risk_route_count: number;
  accepted_request_count: number;
  open_request_count: number;
  active_routes: ImpactRoutePlan[];
  open_requests: ImpactAssistanceRequest[];
  // 设施页“受影响对象”列表需要覆盖已完成/已取消路线与终态请求
  all_routes: ImpactRoutePlan[];
}

// PATCH /api/accessible-facility/:id/deactivate 的请求体
export interface DeactivatePayload {
  impact_note?: string;
  confirmed?: boolean;
}

// PATCH 成功后的响应
export interface DeactivationResult {
  facility_id: number;
  status: string;
  already_processed: boolean;
  deactivated_at: string | null;
  escalated_route_ids: number[];
  blocked_request_ids: number[];
  impact: DeactivationImpact;
}
