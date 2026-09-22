import { create } from "zustand";
import {
  ApiRequestError,
  deactivateFacility,
  fetchDeactivationImpact,
  listAccessibleFacility
} from "../api/AccessibleFacility";
import { useRoutePlanStore } from "./RoutePlanStore";
import { useAssistanceRequestStore } from "./AssistanceRequestStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { DeactivationImpact, DeactivationResult } from "../types/DeactivationImpact";

type State = {
  rows: AccessibleFacility[];
  loading: boolean;
  impact: DeactivationImpact | null;
  impactLoading: boolean;
  submitting: boolean;
  error: string | null;
  load: () => Promise<void>;
  scanImpact: (facilityId: number) => Promise<DeactivationImpact>;
  deactivate: (facilityId: number, impactNote: string) => Promise<DeactivationResult>;
  clearImpact: () => void;
};

export const useAccessibleFacilityStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  impact: null,
  impactLoading: false,
  submitting: false,
  error: null,

  async load() {
    set({ loading: true });
    set({ rows: await listAccessibleFacility(), loading: false });
  },

  async scanImpact(facilityId) {
    set({ impactLoading: true, error: null });
    console.info(LOG_TEMPLATES.AccessibleFacility[4], facilityId);
    try {
      const impact = await fetchDeactivationImpact(facilityId);
      set({ impact, impactLoading: false });
      return impact;
    } finally {
      set({ impactLoading: false });
    }
  },

  async deactivate(facilityId, impactNote) {
    set({ submitting: true, error: null });
    try {
      const result = await deactivateFacility(facilityId, impactNote);
      console.info(
        result.deactivated
          ? LOG_TEMPLATES.AccessibleFacility[5]
          : "无障碍设施停用已处理过，跳过重复提交",
        facilityId,
        result
      );
      result.escalated_route_ids.forEach((id) => console.info(LOG_TEMPLATES.RoutePlan[4], id));
      result.blocked_request_ids.forEach((id) => console.info(LOG_TEMPLATES.AssistanceRequest[4], id));
      await Promise.all([
        get().load(),
        useRoutePlanStore.getState().load(),
        useAssistanceRequestStore.getState().load()
      ]);
      set({ impact: result, submitting: false });
      return result;
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "停用失败，请稍后重试";
      console.info(LOG_TEMPLATES.AccessibleFacility[6], facilityId, message);
      set({ submitting: false, error: message });
      throw err;
    }
  },

  clearImpact() {
    set({ impact: null, error: null });
  }
}));
