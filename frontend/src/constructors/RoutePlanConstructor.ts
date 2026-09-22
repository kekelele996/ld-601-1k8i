import type { RoutePlan } from "../types/RoutePlan";

export const createDefaultRoutePlan = (overrides: Partial<RoutePlan> = {}): RoutePlan => ({
  id: 0,
  user_id: 0,
  origin_text: "",
  destination_text: "",
  route_mode: "WHEELCHAIR",
  risk_level: "LOW",
  status: "IN_PROGRESS",
  estimated_minutes: 0,
  facility_ids: [],
  block_reason: null,
  created_at: "",
  ...overrides
});

export const createRoutePlanForm = createDefaultRoutePlan;
export const createRoutePlanResponse = createDefaultRoutePlan;
