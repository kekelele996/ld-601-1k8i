export const createAssistanceRequestDto = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  route_plan_id: 1,
  helper_id: null,
  request_time: "2026-09-21T08:00:00Z",
  status: "REQUESTED",
  meet_point: "东门坡道入口",
  contact_note: "到站请电话联系",
  blocked_reason: null,
  blocked_at: null,
  ...overrides
});
