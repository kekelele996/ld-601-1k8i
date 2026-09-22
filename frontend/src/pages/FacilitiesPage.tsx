import { useEffect, useMemo, useState } from "react";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { FacilityTag } from "../components/common/FacilityTag";
import { EmptyState } from "../components/common/EmptyState";
import { DeactivationImpactPanel } from "../components/DeactivationImpactPanel";
import { ApiRequestError } from "../api/AccessibleFacility";
import { DISABLED_FACILITY_STATUS } from "../constants/ImpactScope";
import { formatDate, formatFacilityStatus } from "../utils/formatters";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { DeactivationResult } from "../types/DeactivationImpact";

export function FacilitiesPage() {
  const rows = useAccessibleFacilityStore((state) => state.rows);
  const loading = useAccessibleFacilityStore((state) => state.loading);
  const load = useAccessibleFacilityStore((state) => state.load);
  const scanImpact = useAccessibleFacilityStore((state) => state.scanImpact);
  const deactivate = useAccessibleFacilityStore((state) => state.deactivate);
  const clearImpact = useAccessibleFacilityStore((state) => state.clearImpact);

  const [floorFilter, setFloorFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [target, setTarget] = useState<AccessibleFacility | null>(null);
  const [impactNote, setImpactNote] = useState("");
  const [result, setResult] = useState<DeactivationResult | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const floors = useMemo(() => ["ALL", ...Array.from(new Set(rows.map((row) => row.floor)))], [rows]);
  const statuses = useMemo(() => ["ALL", "AVAILABLE", "BLOCKED", "MAINTENANCE", "UNKNOWN", "DISABLED"], []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          (floorFilter === "ALL" || row.floor === floorFilter) &&
          (statusFilter === "ALL" || row.status === statusFilter)
      ),
    [rows, floorFilter, statusFilter]
  );

  const currentImpact = useAccessibleFacilityStore((state) => state.impact);
  const impactLoading = useAccessibleFacilityStore((state) => state.impactLoading);
  const submitting = useAccessibleFacilityStore((state) => state.submitting);

  const openAssessment = async (facility: AccessibleFacility) => {
    setTarget(facility);
    setImpactNote("");
    setResult(null);
    setReadOnly(facility.status === DISABLED_FACILITY_STATUS);
    setModalError(null);
    try {
      await scanImpact(facility.id);
    } catch (err) {
      setModalError(err instanceof ApiRequestError ? err.message : "影响扫描失败，请稍后重试");
    }
  };

  const closeAssessment = () => {
    setTarget(null);
    setResult(null);
    setReadOnly(false);
    setModalError(null);
    setImpactNote("");
    clearImpact();
  };

  const handleConfirm = async () => {
    if (!target) return;
    setModalError(null);
    try {
      const deactivationResult = await deactivate(target.id, impactNote);
      setResult(deactivationResult);
      const latest = useAccessibleFacilityStore
        .getState()
        .rows.find((row) => row.id === target.id);
      if (latest) setTarget(latest);
      setImpactNote("");
    } catch (err) {
      setModalError(
        err instanceof ApiRequestError ? err.message : "停用失败，请稍后重试"
      );
    }
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>设施巡检</h1>
        </div>
      </div>

      <div className="filters">
        <label>
          楼层：
          <select value={floorFilter} onChange={(event) => setFloorFilter(event.target.value)}>
            {floors.map((floor) => (
              <option key={floor} value={floor}>{floor === "ALL" ? "全部楼层" : floor}</option>
            ))}
          </select>
        </label>
        <label>
          状态：
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "全部状态" : formatFacilityStatus(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel wide">
        <h2>设施台账</h2>
        {loading ? (
          <p>加载中…</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="当前筛选条件下暂无设施" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>设施</th>
                <th>位置</th>
                <th>楼层</th>
                <th>状态</th>
                <th>负责部门</th>
                <th>停用影响</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((facility) => (
                <tr key={facility.id} className={facility.status === DISABLED_FACILITY_STATUS ? "row-disabled" : ""}>
                  <td>{facility.id}</td>
                  <td>
                    <strong>{facility.name}</strong>
                    <small className="muted">（{facility.facility_type}）</small>
                  </td>
                  <td>{facility.location_code}</td>
                  <td>{facility.floor}</td>
                  <td><FacilityTag title="" value={facility.status} /></td>
                  <td>{facility.owner_department}</td>
                  <td>
                    {facility.status === DISABLED_FACILITY_STATUS ? (
                      <button className="link-btn" onClick={() => void openAssessment(facility)}>
                        {facility.deactivation_note ?? "（无影响说明）"} · 查看受影响对象
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {facility.status === DISABLED_FACILITY_STATUS ? (
                      <StatusBadge value="DISABLED" label="已停用" />
                    ) : (
                      <button className="action-btn" onClick={() => void openAssessment(facility)}>
                        停用影响评估
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {target ? (
        <div className="modal-mask" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-head">
              <h2>停用影响评估：{target.name}</h2>
              <button className="modal-close" onClick={closeAssessment}>×</button>
            </div>

            {result ? (
              <>
                <p className="impact-success">
                  设施已标为停用（{formatDate(result.deactivated_at ?? "")}
                  ），{result.escalated_route_ids.length} 条路线升为高风险，
                  {result.blocked_request_ids.length} 个未完成请求写入阻塞原因，接单关系保留。
                </p>
                <DeactivationImpactPanel impact={result} />
                <div className="modal-foot">
                  <button className="action-btn" onClick={closeAssessment}>完成</button>
                </div>
              </>
            ) : readOnly ? (
              <>
                <p className="impact-hint">
                  该设施已于 {target.deactivated_at ? formatDate(target.deactivated_at) : "—"} 停用。
                  影响说明：{target.deactivation_note ?? "（无）"}。下列为停用后受影响的对象：
                </p>
                {impactLoading ? <p>正在加载受影响对象…</p> : currentImpact ? (
                  <DeactivationImpactPanel impact={currentImpact} />
                ) : null}
                {modalError ? <p className="impact-warning">{modalError}</p> : null}
                <div className="modal-foot">
                  <button className="action-btn" onClick={closeAssessment}>关闭</button>
                </div>
              </>
            ) : (
              <>
                {impactLoading ? <p>正在扫描引用该设施的路线与协助请求…</p> : currentImpact ? (
                  <DeactivationImpactPanel impact={currentImpact} />
                ) : null}

                <label className="note-field">
                  影响说明
                  {currentImpact?.note_required ? <span className="required">（必填）</span> : null}
                  <textarea
                    rows={3}
                    placeholder="例如：坡道封闭检修，引导改走西门升降平台"
                    value={impactNote}
                    onChange={(event) => setImpactNote(event.target.value)}
                  />
                </label>

                {modalError ? <p className="impact-warning">{modalError}</p> : null}

                <div className="modal-foot">
                  <button onClick={closeAssessment}>取消</button>
                  <button
                    className="action-btn danger-btn"
                    disabled={
                      submitting ||
                      impactLoading ||
                      !currentImpact ||
                      (currentImpact.note_required && impactNote.trim().length === 0)
                    }
                    onClick={() => void handleConfirm()}
                  >
                    {submitting ? "提交中…" : "确认停用"}
                  </button>
                </div>
                <p className="muted small">
                  缺少必填影响说明时整次操作会被拒绝，设施状态、路线风险和阻塞说明保持不变；重复提交只处理一次。
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
