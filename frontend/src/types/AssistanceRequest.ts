export interface AssistanceRequest {
  id: number;
  user_id: number;
  route_plan_id: number;
  helper_id: number | null;
  request_time: string;
  status: string;
  meet_point: string;
  contact_note: string;
  // 引用设施停用后写入的阻塞原因，未完成请求保留接单关系
  block_reason: string | null;
  blocked_by_facility_id: number | null;
}
