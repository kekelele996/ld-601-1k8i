import type { AccessibleFacility } from "../types/AccessibleFacility";

export const createDefaultAccessibleFacility = (
  overrides: Partial<AccessibleFacility> = {}
): AccessibleFacility => ({
  id: 0,
  facility_type: "WHEELCHAIR",
  name: "",
  location_code: "",
  floor: "",
  status: "AVAILABLE",
  last_checked_at: "",
  owner_department: "",
  note: "",
  deactivation_note: null,
  deactivated_at: null,
  deactivated_by: null,
  ...overrides
});

export const createAccessibleFacilityForm = createDefaultAccessibleFacility;
export const createAccessibleFacilityResponse = createDefaultAccessibleFacility;

// 停用影响评估确认表单：巡检员必须填写的影响说明
export const createDeactivationForm = (facilityId: number, impactNote = "") => ({
  facility_id: facilityId,
  impact_note: impactNote,
  confirmed: true
});
