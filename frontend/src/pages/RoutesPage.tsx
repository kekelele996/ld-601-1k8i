import { useEffect, useMemo, useState } from "react";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { FacilityTag } from "../components/common/FacilityTag";
import { EmptyState } from "../components/common/EmptyState";
import {
  formatRisk,
  formatRouteStatus,
  formatFacilityStatus,
  formatBlockReason
} from "../utils/formatters";
import { RoutePlanStatus, RoutePlanStatusText } from "../constants/RoutePlanStatus";
import type { RoutePlan } from "../types/RoutePlan";
import "./Pages.css";

// 路线规划：展示路线新状态（进行中/已完成/已取消）、设施停用后升级的风险与阻塞说明
export function RoutesPage() {
  const { rows, loading, load } = useRoutePlanStore();
  const { rows: facilityRows, load: loadFacilities } = useAccessibleFacilityStore();
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    void load();
    void loadFacilities();
  }, [load, loadFacilities]);

  const filtered = useMemo(
    () => rows.filter((row) => statusFilter === "ALL" || row.status === statusFilter),
    [rows, statusFilter]
  );

  return (
    <section className="page-panel">
      <header className="page-panel__head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>路线规划</h1>
          <p className="page-panel__sub">设施停用后，引用它的进行中路线会自动升为高风险并显示阻塞说明。</p>
        </div>
      </header>

      <div className="filter-bar">
        <label>
          路线状态
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">全部状态</option>
            {RoutePlanStatus.map((value) => (
              <option key={value} value={value}>{RoutePlanStatusText[value]}</option>
            ))}
          </select>
        </label>
        <span className="filter-bar__count">共 {filtered.length} 条{loading && "（加载中…）"}</span>
      </div>

      {!loading && filtered.length === 0 && <EmptyState title="暂无路线" />}

      <div className="route-list">
        {filtered.map((route) => (
          <RouteRow key={route.id} route={route} facilityNameOf={(id) => facilityRows.find((row) => row.id === id)?.name ?? `设施 #${id}`} facilityStatusOf={(id) => facilityRows.find((row) => row.id === id)?.status ?? "UNKNOWN"} />
        ))}
      </div>
    </section>
  );
}

function RouteRow({
  route,
  facilityNameOf,
  facilityStatusOf
}: {
  route: RoutePlan;
  facilityNameOf: (id: number) => string;
  facilityStatusOf: (id: number) => string;
}) {
  const high = route.risk_level === "HIGH";
  return (
    <article className="route-card">
      <div className="route-card__head">
        <h3>
          <span className="link-id">#{route.id}</span>
          {route.origin_text} → {route.destination_text}
        </h3>
        <div className="route-card__badges">
          <StatusBadge
            value={route.status}
            label={formatRouteStatus(route.status)}
            tone={route.status === "IN_PROGRESS" ? "success" : "neutral"}
          />
          <RouteRiskPanel
            title="风险"
            value={`RISK_${route.risk_level}`}
            label={formatRisk(route.risk_level)}
            tone={high ? "danger" : route.risk_level === "MEDIUM" ? "warning" : "neutral"}
          />
        </div>
      </div>

      <p className="route-card__meta">
        出行方式：{route.route_mode} · 预计 {route.estimated_minutes} 分钟
      </p>

      <div className="route-card__facilities">
        {route.facility_ids.map((id) => (
          <FacilityTag
            key={id}
            title={facilityNameOf(id)}
            value={facilityStatusOf(id)}
            label={formatFacilityStatus(facilityStatusOf(id))}
            tone={facilityStatusOf(id) === "DISABLED" ? "danger" : "neutral"}
          />
        ))}
      </div>

      <p className={"block-reason" + (route.block_reason ? " block-reason--active" : "")}>
        阻塞说明：{formatBlockReason(route.block_reason)}
      </p>
    </article>
  );
}
