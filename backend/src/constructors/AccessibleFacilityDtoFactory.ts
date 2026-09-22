import type { AccessibleFacility } from "../models/AccessibleFacility";

// 列表 / 详情响应 DTO 构造器：停用影响评估新增的三个字段必须随设施响应一并下发
export const createAccessibleFacilityDto = (
  overrides: Partial<AccessibleFacility> = {}
): AccessibleFacility => ({
  id: 0,
  facility_type: "WHEELCHAIR",
  name: "",
  location_code: "",
  floor: "",
  status: "UNKNOWN",
  last_checked_at: "",
  owner_department: "",
  note: "",
  deactivation_note: null,
  deactivated_at: null,
  deactivated_by: null,
  ...overrides
});

export const toAccessibleFacilityDto = (row: AccessibleFacility): AccessibleFacility =>
  createAccessibleFacilityDto({ ...row });
