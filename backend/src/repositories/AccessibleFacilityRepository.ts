import { seed } from "../seed";
import type { AccessibleFacility } from "../models/AccessibleFacility";

export const accessibleFacilityRepository = {
  findAll: (): AccessibleFacility[] => seed.accessibleFacility,

  findById: (id: number): AccessibleFacility | undefined =>
    seed.accessibleFacility.find((row) => row.id === id),

  save: (row: unknown) => row,

  // 停用影响评估确认后的原地落库
  markDisabled: (id: number, patch: {
    status: string;
    deactivation_note: string | null;
    deactivated_at: string;
    deactivated_by: number | null;
  }): AccessibleFacility | undefined => {
    const row = seed.accessibleFacility.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
