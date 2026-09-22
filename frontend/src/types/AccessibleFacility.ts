export interface AccessibleFacility {
  id: number;
  facility_type: string;
  name: string;
  location_code: string;
  floor: string;
  status: string;
  last_checked_at: string;
  owner_department: string;
  note: string;
  // 停用影响评估新增字段
  deactivation_note: string | null;
  deactivated_at: string | null;
  deactivated_by: number | null;
}
