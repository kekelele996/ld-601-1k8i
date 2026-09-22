import { seed } from "../seed";
import type { RoutePlan } from "../models/RoutePlan";
import { ACTIVE_ROUTE_PLAN_STATUS } from "../constants/RoutePlanStatus";

export const routePlanRepository = {
  findAll: (): RoutePlan[] => seed.routePlan,

  save: (row: unknown) => row,

  // 引用指定设施的路线（含任意状态，供影响扫描与设施页“受影响对象”展示）
  findByFacilityId: (facilityId: number): RoutePlan[] =>
    seed.routePlan.filter((row) => row.facility_ids.includes(facilityId)),

  // 停用影响评估扫描范围：进行中且引用该设施的路线
  findActiveByFacilityId: (facilityId: number): RoutePlan[] =>
    seed.routePlan.filter(
      (row) => row.status === ACTIVE_ROUTE_PLAN_STATUS && row.facility_ids.includes(facilityId)
    ),

  // 设施停用确认：受影响的进行中路线统一升至高风险并写入阻塞说明
  escalateRiskByFacility: (facilityId: number, riskLevel: string, blockReason: string): RoutePlan[] => {
    const affected: RoutePlan[] = [];
    for (const row of seed.routePlan) {
      if (row.status === ACTIVE_ROUTE_PLAN_STATUS && row.facility_ids.includes(facilityId)) {
        row.risk_level = riskLevel;
        row.block_reason = blockReason;
        affected.push(row);
      }
    }
    return affected;
  }
};
