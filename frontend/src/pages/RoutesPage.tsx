import { useEffect, useMemo, useState } from "react";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useUserProfileStore } from "../stores/UserProfileStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { usePagination } from "../hooks/usePagination";
import { HIGH_RISK_LEVEL } from "../constants/ImpactScope";
import { formatDate, formatRouteStatus } from "../utils/formatters";
import type { RoutePlan } from "../types/RoutePlan";

function RouteRow({ route, userName, facilityNames }: { route: RoutePlan; userName: string; facilityNames: string }) {
  return (
    <article className={"card route-card " + (route.risk_level === HIGH_RISK_LEVEL ? "card-danger" : "")}>
      <div className="card-head">
        <strong>路线 #{route.id}</strong>
        <StatusBadge value={route.status} label={formatRouteStatus(route.status)} />
      </div>
      <p className="route-text">{route.origin_text} → {route.destination_text}</p>
      <p className="muted small">
        出行人：{userName} · 方式：{route.route_mode} · 预计 {route.estimated_minutes} 分钟 · 创建于 {formatDate(route.created_at)}
      </p>
      <p className="muted small">途经设施：{facilityNames}</p>
      <RouteRiskPanel title="路线风险" value={route.risk_level} blockedReason={route.blocked_reason} />
    </article>
  );
}

export function RoutesPage() {
  const rows = useRoutePlanStore((state) => state.rows);
  const load = useRoutePlanStore((state) => state.load);
  const users = useUserProfileStore((state) => state.rows);
  const loadUsers = useUserProfileStore((state) => state.load);
  const facilities = useAccessibleFacilityNames();
  const [riskFilter, setRiskFilter] = useState("ALL");

  useEffect(() => {
    void load();
    void loadUsers();
  }, [load, loadUsers]);

  const filtered = useMemo(
    () => rows.filter((row) => riskFilter === "ALL" || row.risk_level === riskFilter),
    [rows, riskFilter]
  );
  const { pageRows, page, setPage, total } = usePagination(filtered);
  const highCount = rows.filter((row) => row.risk_level === HIGH_RISK_LEVEL && row.status === "ACTIVE").length;

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>路线规划</h1>
        </div>
        <StatusBadge value={HIGH_RISK_LEVEL} label={`进行中高风险路线 ${highCount} 条`} />
      </div>

      <div className="filters">
        <label>
          风险等级：
          <select value={riskFilter} onChange={(event) => { setRiskFilter(event.target.value); setPage(1); }}>
            <option value="ALL">全部</option>
            <option value="HIGH">高</option>
            <option value="MEDIUM">中</option>
            <option value="LOW">低</option>
          </select>
        </label>
        <span className="muted small">共 {total} 条 · 第 {page} 页</span>
      </div>

      {pageRows.length === 0 ? (
        <EmptyState title="暂无符合条件的路线" />
      ) : (
        <div className="card-grid">
          {pageRows.map((route) => (
            <RouteRow
              key={route.id}
              route={route}
              userName={users.find((user) => user.id === route.user_id)?.nickname ?? `用户 #${route.user_id}`}
              facilityNames={route.facility_ids
                .map((id) => facilities.get(id) ?? `设施 #${id}`)
                .join("、")}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function useAccessibleFacilityNames() {
  // 设施停用后名称不影响展示，这里通过台账 store 拉一次最新名称映射。
  const facilityRows = useAccessibleFacilityStore((state) => state.rows);
  const loadFacilities = useAccessibleFacilityStore((state) => state.load);
  useEffect(() => {
    void loadFacilities();
  }, [loadFacilities]);
  return useMemo(
    () => new Map(facilityRows.map((row) => [row.id, row.name])),
    [facilityRows]
  );
}
