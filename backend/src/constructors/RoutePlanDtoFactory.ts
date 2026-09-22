export const createRoutePlanDto = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  origin_text: "东门公交站",
  destination_text: "服务总台",
  route_mode: "WHEELCHAIR_FRIENDLY",
  risk_level: "LOW",
  status: "ACTIVE",
  estimated_minutes: 8,
  facility_ids: [1, 2],
  blocked_reason: null,
  created_at: "2026-09-20T08:00:00Z",
  ...overrides
});
