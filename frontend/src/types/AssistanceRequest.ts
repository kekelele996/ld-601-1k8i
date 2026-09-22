export interface AssistanceRequest {
  id: number;
  user_id: number;
  route_plan_id: number;
  helper_id: number | null;
  request_time: string;
  status: string;
  meet_point: string;
  contact_note: string;
  blocked_reason: string | null;
  blocked_at: string | null;
}
