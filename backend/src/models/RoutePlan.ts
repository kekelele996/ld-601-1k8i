export interface RoutePlan {
  id: number;
  user_id: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  risk_level: string;
  // 路线生命周期状态：IN_PROGRESS / COMPLETED / CANCELLED
  status: string;
  estimated_minutes: number;
  facility_ids: number[];
  // 因设施停用而升级风险时写入的阻塞说明
  block_reason: string | null;
  created_at: string;
}
