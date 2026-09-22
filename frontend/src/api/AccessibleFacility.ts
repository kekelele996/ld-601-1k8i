import { mockData } from "../mocks/seedData";
import {
  applyFacilityDeactivation,
  DeactivationRejectedError,
  scanFacilityDeactivation
} from "../mocks/deactivationEngine";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { DeactivationImpact, DeactivationResult } from "../types/DeactivationImpact";

const endpoint = "/api/accessible-facility";

export class ApiRequestError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

export async function listAccessibleFacility(): Promise<AccessibleFacility[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(mockData.accessibleFacility as unknown as AccessibleFacility[])];
}

export async function saveAccessibleFacility(payload: AccessibleFacility) {
  console.info("save AccessibleFacility", payload);
  return payload;
}

export async function fetchDeactivationImpact(facilityId: number): Promise<DeactivationImpact> {
  try {
    const res = await fetch(`${endpoint}/${facilityId}/deactivation-impact`);
    if (res.ok) return await res.json();
  } catch {
    // fallback below
  }
  return scanFacilityDeactivation(facilityId);
}

export async function deactivateFacility(
  facilityId: number,
  impactNote: string
): Promise<DeactivationResult> {
  try {
    const res = await fetch(`${endpoint}/${facilityId}/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ impact_note: impactNote })
    });
    if (res.ok) return await res.json();
    const payload = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
    throw new ApiRequestError(
      payload?.code ?? "DEACTIVATION_FAILED",
      payload?.message ?? "停用失败，请稍后重试",
      res.status
    );
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    // 网络不可达时走本地降级，离线评审也能看到完整影响评估流程。
    try {
      return applyFacilityDeactivation(facilityId, impactNote);
    } catch (localErr) {
      if (localErr instanceof DeactivationRejectedError) {
        throw new ApiRequestError(localErr.code, localErr.message, localErr.status);
      }
      throw localErr;
    }
  }
}
