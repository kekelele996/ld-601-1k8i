export interface AssistanceRequest {
  id: number;
  user_id: number;
  route_plan_id: number;
  helper_id: number | null;
  request_time: string;
  status: string;
  meet_point: string;
  contact_note: string;
  // 引用设施被停用后写入的阻塞原因；终态请求不写入
  block_reason: string | null;
  // 触发阻塞的停用设施 id，未阻塞为 null
  blocked_by_facility_id: number | null;
}
