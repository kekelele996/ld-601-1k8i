import { seed } from "../seed";
import type { AssistanceRequest } from "../models/AssistanceRequest";
import { OPEN_ASSISTANCE_STATUSES } from "../constants/AssistanceFlow";

export const assistanceRequestRepository = {
  findAll: (): AssistanceRequest[] => seed.assistanceRequest,

  save: (row: unknown) => row,

  // 未完成请求：状态仍在流转中（REQUESTED / ACCEPTED / ARRIVED）
  isOpenStatus: (status: string): boolean =>
    (OPEN_ASSISTANCE_STATUSES as readonly string[]).includes(status),

  // 停用影响评估扫描范围：未完成且其路线引用了指定设施的请求（保留 helper 接单关系）
  findOpenByFacilityId: (facilityId: number, routeIds: number[]): AssistanceRequest[] =>
    seed.assistanceRequest.filter(
      (row) =>
        routeIds.includes(row.route_plan_id) &&
        (OPEN_ASSISTANCE_STATUSES as readonly string[]).includes(row.status)
    ),

  // 设施停用确认：未完成请求写入阻塞原因，接单关系（helper_id / status）保持不变
  blockOpenByFacility: (
    facilityId: number,
    routeIds: number[],
    blockReason: string
  ): AssistanceRequest[] => {
    const affected: AssistanceRequest[] = [];
    for (const row of seed.assistanceRequest) {
      if (
        routeIds.includes(row.route_plan_id) &&
        (OPEN_ASSISTANCE_STATUSES as readonly string[]).includes(row.status)
      ) {
        row.block_reason = blockReason;
        row.blocked_by_facility_id = facilityId;
        affected.push(row);
      }
    }
    return affected;
  }
};
