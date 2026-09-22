import { useEffect } from "react";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { useAssistanceRequestStore } from "../stores/AssistanceRequestStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { DISABLED_FACILITY_STATUS, HIGH_RISK_LEVEL } from "../constants/ImpactScope";
import { formatAssistanceStatus, formatDate } from "../utils/formatters";

export function DashboardPage() {
  const requests = useAssistanceRequestStore((state) => state.rows);
  const loadRequests = useAssistanceRequestStore((state) => state.load);
  const routes = useRoutePlanStore((state) => state.rows);
  const loadRoutes = useRoutePlanStore((state) => state.load);
  const facilities = useAccessibleFacilityStore((state) => state.rows);
  const loadFacilities = useAccessibleFacilityStore((state) => state.load);

  useEffect(() => {
    void loadRequests();
    void loadRoutes();
    void loadFacilities();
  }, [loadRequests, loadRoutes, loadFacilities]);

  const unfinishedCount = requests.filter(
    (request) => ["REQUESTED", "ACCEPTED", "ARRIVED"].includes(request.status)
  ).length;
  const highRiskRoutes = routes.filter(
    (route) => route.status === "ACTIVE" && route.risk_level === HIGH_RISK_LEVEL
  );
  const blockedRequests = requests.filter((request) => request.blocked_reason !== null);
  const disabledCount = facilities.filter(
    (facility) => facility.status === DISABLED_FACILITY_STATUS
  ).length;

  return (
    <section className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>通行总览</h1>
        </div>
        <StatusBadge value={blockedRequests.length > 0 ? "BLOCKED" : "ALL_CLEAR"} />
      </section>

      <section className="metrics">
        <StatCard label="未完成协助请求" value={unfinishedCount} />
        <StatCard label="进行中高风险路线" value={highRiskRoutes.length} />
        <StatCard label="已停用设施" value={disabledCount} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>风险路线（设施停用后自动升级）</h2>
          {highRiskRoutes.length === 0 ? (
            <p className="muted small">暂无高风险进行中路线</p>
          ) : (
            <div className="risk-stack">
              {highRiskRoutes.map((route) => (
                <div key={route.id} className="risk-row">
                  <strong>#{route.id} {route.origin_text} → {route.destination_text}</strong>
                  <RouteRiskPanel
                    title=""
                    value={route.risk_level}
                    blockedReason={route.blocked_reason}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h2>设施阻塞协助请求</h2>
          {blockedRequests.length === 0 ? (
            <p className="muted small">暂无阻塞请求</p>
          ) : (
            <ul className="block-list">
              {blockedRequests.map((request) => (
                <li key={request.id}>
                  <StatusBadge value={request.status} label={formatAssistanceStatus(request.status)} />
                  <span>请求 #{request.id}（志愿者 {request.helper_id ? `#${request.helper_id}` : "未接单"}）</span>
                  <small className="blocked-reason">
                    {request.blocked_reason}
                    {request.blocked_at ? ` · ${formatDate(request.blocked_at)}` : ""}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </section>
  );
}
