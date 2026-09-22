import { useCallback, useState } from "react";
import { fetchDeactivationImpact, deactivateFacility } from "../api/AccessibleFacility";
import { ApiClientError } from "../api/httpClient";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type {
  DeactivationImpact,
  DeactivationResult
} from "../types/DeactivationImpact";

// 停用影响评估：扫描 → （高风险路线/已接单请求时）填写影响说明 → 确认停用
export function useDeactivationImpact() {
  const [impact, setImpact] = useState<DeactivationImpact | null>(null);
  const [impactNote, setImpactNote] = useState("");
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<DeactivationResult | null>(null);

  const reset = useCallback(() => {
    setImpact(null);
    setImpactNote("");
    setError(null);
    setLastResult(null);
  }, []);

  const scan = useCallback(async (facilityId: number) => {
    setScanning(true);
    setError(null);
    try {
      console.info(LOG_TEMPLATES.AccessibleFacility[4], { facilityId });
      const result = await fetchDeactivationImpact(facilityId);
      setImpact(result);
      setImpactNote("");
      return result;
    } catch (err) {
      const message = (err as ApiClientError).message ?? ERROR_MESSAGES.VALIDATION_FAILED;
      setError(message);
      return null;
    } finally {
      setScanning(false);
    }
  }, []);

  const confirm = useCallback(
    async (facilityId: number): Promise<DeactivationResult | null> => {
      setSubmitting(true);
      setError(null);
      try {
        const result = await deactivateFacility(facilityId, {
          impact_note: impactNote.trim(),
          confirmed: true
        });
        setLastResult(result);
        setImpact(result.impact);
        return result;
      } catch (err) {
        // 缺少影响说明被后端整次拒绝：保持弹窗打开，设施/路线/请求均未变更
        setError((err as ApiClientError).message ?? ERROR_MESSAGES.VALIDATION_FAILED);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [impactNote]
  );

  return {
    impact,
    impactNote,
    setImpactNote,
    scanning,
    submitting,
    error,
    lastResult,
    scan,
    confirm,
    reset
  };
}
