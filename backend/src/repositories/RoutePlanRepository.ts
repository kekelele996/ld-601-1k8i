import { seed } from "../seed";
import type { RoutePlan } from "../models/RoutePlan";

export const routePlanRepository = {
  findAll: (): RoutePlan[] => seed.routePlan,
  findById: (id: number): RoutePlan | undefined => seed.routePlan.find((row) => row.id === id),
  findByFacilityId: (facilityId: number): RoutePlan[] =>
    seed.routePlan.filter((row) => row.facility_ids.includes(facilityId)),
  save: (row: unknown) => row,
  update: (id: number, patch: Partial<RoutePlan>): RoutePlan | undefined => {
    const target = seed.routePlan.find((row) => row.id === id);
    if (!target) return undefined;
    Object.assign(target, patch);
    return target;
  }
};
