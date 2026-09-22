import type { AccessibleFacility } from "../types/AccessibleFacility";

export const createDefaultAccessibleFacility = (overrides: Partial<AccessibleFacility> = {}): AccessibleFacility => ({
  id: 1,
  facility_type: "RAMP",
  name: "东门无障碍坡道",
  location_code: "EAST-GATE-RAMP-01",
  floor: "1F",
  status: "AVAILABLE",
  last_checked_at: "2026-09-20T09:00:00Z",
  owner_department: "站务一部",
  note: "东门主入口坡道",
  deactivated_at: null,
  deactivated_by: null,
  deactivation_note: null,
  ...overrides
});

export const createAccessibleFacilityForm = createDefaultAccessibleFacility;
export const createAccessibleFacilityResponse = createDefaultAccessibleFacility;
