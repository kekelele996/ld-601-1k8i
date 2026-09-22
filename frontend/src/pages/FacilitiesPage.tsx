import { useEffect, useMemo, useState } from "react";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAssistanceRequestStore } from "../stores/AssistanceRequestStore";
import { DeactivationImpactModal } from "../components/facility/DeactivationImpactModal";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import {
  formatDate,
  formatFacilityStatus,
  formatRouteStatus,
  formatAssistanceStatus,
  formatRisk
} from "../utils/formatters";
import { FacilityStatus, FacilityStatusTextZh } from "../constants/FacilityStatus";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import "./Pages.css";

// 设施巡检：设施列表、楼层筛选、停用影响评估入口、受影响对象展示
export function FacilitiesPage() {
  const { rows, loading, load, scanImpact, clearImpact } = useAccessibleFacilityStore();
  const { rows: routeRows, load: loadRoutes } = useRoutePlanStore();
  const { rows: assistanceRows, load: loadAssistance } = useAssistanceRequestStore();
  const [floor, setFloor] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalFacilityId, setModalFacilityId] = useState<number | null>(null);

  useEffect(() => {
    void load();
    void loadRoutes();
    void loadAssistance();
  }, [load, loadRoutes, loadAssistance]);

  const floors = useMemo(
    () => ["ALL", ...Array.from(new Set(rows.map((row) => row.floor)))],
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          (floor === "ALL" || row.floor === floor) &&
          (statusFilter === "ALL" || row.status === statusFilter)
      ),
    [rows, floor, statusFilter]
  );

  // 设施页“受影响对象”：引用该设施的全部路线 + 其未完成协助请求（刷新后从后端重读，保持一致）
  const affectedOf = (facilityId: number) => {
    const routes = routeRows.filter((route) => route.facility_ids.includes(facilityId));
    const routeIds = new Set(routes.map((route) => route.id));
    const requests = assistanceRows.filter(
      (request) => routeIds.has(request.route_plan_id) && request.blocked_by_facility_id === facilityId
    );
    return { routes, requests };
  };

  const openImpact = async (facilityId: number) => {
    setModalFacilityId(facilityId);
    await scanImpact(facilityId);
  };

  const refreshAfterConfirm = async () => {
    // 设施、路线、协助三个 store 全部重拉，路线页与协助页随后打开即读到新状态
    await Promise.all([load(), loadRoutes(), loadAssistance()]);
    if (modalFacilityId !== null) {
      await scanImpact(modalFacilityId);
    }
  };

  return (
    <section className="page-panel">
      <header className="page-panel__head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>设施巡检</h1>
          <p className="page-panel__sub">巡检员停用设施前必须完成影响评估；高风险路线或已接单请求需填写影响说明。</p>
        </div>
      </header>

      <div className="filter-bar">
        <label>
          楼层
          <select value={floor} onChange={(event) => setFloor(event.target.value)}>
            {floors.map((value) => (
              <option key={value} value={value}>{value === "ALL" ? "全部楼层" : value}</option>
            ))}
          </select>
        </label>
        <label>
          状态
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">全部状态</option>
            {FacilityStatus.map((value) => (
              <option key={value} value={value}>{FacilityStatusTextZh[value]}</option>
            ))}
          </select>
        </label>
        <span className="filter-bar__count">共 {filtered.length} 项{loading && "（加载中…）"}</span>
      </div>

      {!loading && filtered.length === 0 && <EmptyState title="当前筛选条件下暂无设施" />}

      <div className="facility-grid">
        {filtered.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            affected={affectedOf(facility.id)}
            onDeactivate={() => void openImpact(facility.id)}
          />
        ))}
      </div>

      {modalFacilityId !== null && (
        <DeactivationImpactModal
          facilityId={modalFacilityId}
          onClose={() => {
            setModalFacilityId(null);
            clearImpact();
          }}
          onConfirmed={refreshAfterConfirm}
        />
      )}

    </section>
  );
}

interface CardProps {
  facility: AccessibleFacility;
  affected: {
    routes: ReturnType<typeof useRoutePlanStore.getState>["rows"];
    requests: ReturnType<typeof useAssistanceRequestStore.getState>["rows"];
  };
  onDeactivate: () => void;
}

function FacilityCard({ facility, affected, onDeactivate }: CardProps) {
  const disabled = facility.status === "DISABLED" || facility.deactivated_at !== null;
  return (
    <article className={"facility-card" + (disabled ? " facility-card--disabled" : "")}>
      <div className="facility-card__head">
        <div>
          <h3>{facility.name}</h3>
          <p className="facility-card__code">
            {facility.location_code} · {facility.floor}
          </p>
        </div>
        <StatusBadge
          value={facility.status}
          label={formatFacilityStatus(facility.status)}
          tone={disabled ? "danger" : facility.status === "AVAILABLE" ? "success" : "warning"}
        />
      </div>

      <dl className="facility-card__meta">
        <div><dt>类型</dt><dd>{facility.facility_type}</dd></div>
        <div><dt>责任部门</dt><dd>{facility.owner_department}</dd></div>
        <div><dt>最近巡检</dt><dd>{formatDate(facility.last_checked_at)}</dd></div>
        <div><dt>备注</dt><dd>{facility.note || "—"}</dd></div>
      </dl>

      {disabled && facility.deactivation_note && (
        <p className="facility-card__note">停用影响说明：{facility.deactivation_note}</p>
      )}
      {disabled && facility.deactivated_at && (
        <p className="facility-card__note">停用时间：{formatDate(facility.deactivated_at)}</p>
      )}

      {/* 设施页列出受影响对象：路线风险/状态与协助请求阻塞原因 */}
      <div className="facility-card__affected">
        <h4>受影响路线（{affected.routes.length}）</h4>
        {affected.routes.length === 0 && <EmptyState title="暂无引用路线" />}
        <ul>
          {affected.routes.map((route) => (
            <li key={route.id}>
              <span className="link-id">#{route.id}</span>
              <span className="link-text">{route.origin_text} → {route.destination_text}</span>
              <StatusBadge
                value={route.status}
                label={formatRouteStatus(route.status)}
                tone={route.status === "IN_PROGRESS" ? "success" : "neutral"}
              />
              <StatusBadge
                value={`RISK_${route.risk_level}`}
                label={`风险 ${formatRisk(route.risk_level)}`}
                tone={route.risk_level === "HIGH" ? "danger" : route.risk_level === "MEDIUM" ? "warning" : "neutral"}
              />
              {route.block_reason && <p className="block-reason">阻塞说明：{route.block_reason}</p>}
            </li>
          ))}
        </ul>

        <h4>被阻塞的协助请求（{affected.requests.length}）</h4>
        {affected.requests.length === 0 && <EmptyState title="暂无被阻塞请求" />}
        <ul>
          {affected.requests.map((request) => (
            <li key={request.id}>
              <span className="link-id">请求 #{request.id}</span>
              <StatusBadge
                value={request.status}
                label={formatAssistanceStatus(request.status)}
                tone={request.helper_id !== null ? "warning" : "neutral"}
              />
              {request.helper_id !== null && <StatusBadge value="HELPER_KEPT" label={`接单志愿者 #${request.helper_id}（保留）`} tone="success" />}
              <p className="block-reason">阻塞原因：{request.block_reason ?? "—"}</p>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="facility-card__action"
        onClick={onDeactivate}
      >
        {disabled ? "查看停用影响评估" : "停用影响评估"}
      </button>
      {disabled && (
        <p className="facility-card__idem">重复提交只处理一次，阻塞说明保持首次结果</p>
      )}
    </article>
  );
}
