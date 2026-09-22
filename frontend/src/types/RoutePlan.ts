export interface RoutePlan {
  id: number;
  user_id: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  risk_level: string;
  status: string;
  estimated_minutes: number;
  facility_ids: number[];
  blocked_reason: string | null;
  created_at: string;
}
