import { useEffect } from "react";
import { useAssistanceRequestStore } from "../stores/AssistanceRequestStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import {
  formatAssistanceStatus,
  formatFacilityStatus,
  formatRisk,
  formatRouteStatus
} from "../utils/formatters";
import "./Pages.css";

// 通行总览：今日协助请求、风险路线、停用设施与阻塞统计
export function DashboardPage() {
  const { rows: assistanceRows, load: loadAssistance } = useAssistanceRequestStore();
  const { rows: routeRows, load: loadRoutes } = useRoutePlanStore();
  const { rows: facilityRows, load: loadFacilities } = useAccessibleFacilityStore();

  useEffect(() => {
    void loadAssistance();
    void loadRoutes();
    void loadFacilities();
  }, [loadAssistance, loadRoutes, loadFacilities]);

  const openRequests = assistanceRows.filter((row) =>
    ["REQUESTED", "ACCEPTED", "ARRIVED"].includes(row.status)
  );
  const activeRoutes = routeRows.filter((row) => row.status === "IN_PROGRESS");
  const highRiskRoutes = activeRoutes.filter((row) => row.risk_level === "HIGH");
  const blockedRequests = assistanceRows.filter((row) => row.block_reason !== null);
  const disabledFacilities = facilityRows.filter((row) => row.status === "DISABLED");

  return (
    <section className="page-panel">
      <header className="page-panel__head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>通行总览</h1>
          <p className="page-panel__sub">设施停用影响评估后，路线风险与协助阻塞在此联动展示。</p>
        </div>
      </header>

      <section className="metrics">
        <StatCard label="未完成协助请求" value={openRequests.length} />
        <StatCard label="进行中路线" value={activeRoutes.length} />
        <StatCard label="高风险路线" value={highRiskRoutes.length} />
        <StatCard label="被阻塞协助请求" value={blockedRequests.length} />
        <StatCard label="已停用设施" value={disabledFacilities.length} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>风险路线（进行中）</h2>
          {activeRoutes.length === 0 && <p className="dimask__empty">暂无进行中路线</p>}
          <div className="table">
            {activeRoutes.map((route) => (
              <article key={route.id} className="row" style={{ gridTemplateColumns: "1fr auto auto" }}>
                <strong>
                  <span className="link-id">#{route.id}</span>
                  {route.origin_text} → {route.destination_text}
                </strong>
                <StatusBadge
                  value={route.status}
                  label={formatRouteStatus(route.status)}
                  tone="success"
                />
                <RouteRiskPanel
                  title="风险"
                  value={`RISK_${route.risk_level}`}
                  label={formatRisk(route.risk_level)}
                  tone={route.risk_level === "HIGH" ? "danger" : "warning"}
                />
                {route.block_reason && (
                  <p className="block-reason block-reason--active" style={{ gridColumn: "1 / -1" }}>
                    阻塞说明：{route.block_reason}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>协助与设施状态</h2>
          <div className="table">
            {openRequests.slice(0, 6).map((request) => (
              <article key={request.id} className="row" style={{ gridTemplateColumns: "1fr auto" }}>
                <span>
                  请求 #{request.id} · 路线 #{request.route_plan_id}
                </span>
                <StatusBadge
                  value={request.status}
                  label={formatAssistanceStatus(request.status)}
                  tone={request.block_reason ? "danger" : "success"}
                />
              </article>
            ))}
            {disabledFacilities.map((facility) => (
              <article key={facility.id} className="row" style={{ gridTemplateColumns: "1fr auto" }}>
                <span>{facility.name}</span>
                <StatusBadge
                  value={facility.status}
                  label={formatFacilityStatus(facility.status)}
                  tone="danger"
                />
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
