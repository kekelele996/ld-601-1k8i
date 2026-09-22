import { seed } from "../seed";
import type { AssistanceRequest } from "../models/AssistanceRequest";

export const assistanceRequestRepository = {
  findAll: (): AssistanceRequest[] => seed.assistanceRequest,
  findById: (id: number): AssistanceRequest | undefined =>
    seed.assistanceRequest.find((row) => row.id === id),
  findByRoutePlanIds: (routePlanIds: number[]): AssistanceRequest[] =>
    seed.assistanceRequest.filter((row) => routePlanIds.includes(row.route_plan_id)),
  save: (row: unknown) => row,
  update: (id: number, patch: Partial<AssistanceRequest>): AssistanceRequest | undefined => {
    const target = seed.assistanceRequest.find((row) => row.id === id);
    if (!target) return undefined;
    Object.assign(target, patch);
    return target;
  }
};
