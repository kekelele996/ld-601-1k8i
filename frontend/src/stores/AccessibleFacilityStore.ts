import { create } from "zustand";
import {
  listAccessibleFacility,
  fetchDeactivationImpact,
  deactivateFacility
} from "../api/AccessibleFacility";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type {
  DeactivationImpact,
  DeactivationResult,
  DeactivatePayload
} from "../types/DeactivationImpact";

type State = {
  rows: AccessibleFacility[];
  loading: boolean;
  // 当前展开停用影响评估的设施
  activeImpact: DeactivationImpact | null;
  acting: boolean;
  load: () => Promise<void>;
  scanImpact: (facilityId: number) => Promise<DeactivationImpact | null>;
  confirmDeactivation: (
    facilityId: number,
    payload: DeactivatePayload
  ) => Promise<DeactivationResult | null>;
  clearImpact: () => void;
};

export const useAccessibleFacilityStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  activeImpact: null,
  acting: false,

  async load() {
    set({ loading: true });
    try {
      set({ rows: await listAccessibleFacility() });
    } finally {
      set({ loading: false });
    }
  },

  // 停用影响评估扫描（不落库）
  async scanImpact(facilityId) {
    const impact = await fetchDeactivationImpact(facilityId);
    set({ activeImpact: impact });
    return impact;
  },

  // 确认停用；成功后用列表 + 评估结果同时刷新，保证刷新页面后状态一致
  async confirmDeactivation(facilityId, payload) {
    set({ acting: true });
    try {
      const result = await deactivateFacility(facilityId, payload);
      set({ activeImpact: result.impact });
      // 重新拉取设施、路线、协助请求，保证跨页状态一致
      await Promise.all([
        get().load()
      ]);
      return result;
    } finally {
      set({ acting: false });
    }
  },

  clearImpact() {
    set({ activeImpact: null });
  }
}));
