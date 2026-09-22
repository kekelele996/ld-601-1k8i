import { seed } from "../seed";
import type { AccessibleFacility } from "../models/AccessibleFacility";

export const accessibleFacilityRepository = {
  findAll: (): AccessibleFacility[] => seed.accessibleFacility,
  findById: (id: number): AccessibleFacility | undefined =>
    seed.accessibleFacility.find((row) => row.id === id),
  save: (row: unknown) => row,
  update: (id: number, patch: Partial<AccessibleFacility>): AccessibleFacility | undefined => {
    const target = seed.accessibleFacility.find((row) => row.id === id);
    if (!target) return undefined;
    Object.assign(target, patch);
    return target;
  }
};
