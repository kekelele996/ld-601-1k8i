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
  // 停用影响说明（巡检员确认停用时填写）
  deactivation_note: string | null;
  // 最近一次停用影响评估时间（ISO 字符串），未停用为 null；也是“重复提交只处理一次”的幂等标记
  deactivated_at: string | null;
  deactivated_by: number | null;
}
