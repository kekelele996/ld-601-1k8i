import type { AssistanceRequest } from "../types/AssistanceRequest";

export const createDefaultAssistanceRequest = (
  overrides: Partial<AssistanceRequest> = {}
): AssistanceRequest => ({
  id: 0,
  user_id: 0,
  route_plan_id: 0,
  helper_id: null,
  request_time: "",
  status: "REQUESTED",
  meet_point: "",
  contact_note: "",
  block_reason: null,
  blocked_by_facility_id: null,
  ...overrides
});

export const createAssistanceRequestForm = createDefaultAssistanceRequest;
export const createAssistanceRequestResponse = createDefaultAssistanceRequest;
