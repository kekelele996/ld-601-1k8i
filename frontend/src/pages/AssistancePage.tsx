import { useEffect, useMemo } from "react";
import { useAssistanceRequestStore } from "../stores/AssistanceRequestStore";
import { useUserProfileStore } from "../stores/UserProfileStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { UserMiniCard } from "../components/common/UserMiniCard";
import { EmptyState } from "../components/common/EmptyState";
import { useAssistanceFlow } from "../hooks/useAssistanceFlow";
import { formatAssistanceStatus, formatDate } from "../utils/formatters";
import type { AssistanceRequest } from "../types/AssistanceRequest";

function RequestCard({
  request,
  userName,
  helperName,
  routeText
}: {
  request: AssistanceRequest;
  userName: string;
  helperName: string;
  routeText: string;
}) {
  return (
    <article className={"card request-card " + (request.blocked_reason ? "card-danger" : "")}>
      <div className="card-head">
        <strong>协助请求 #{request.id}</strong>
        <StatusBadge value={request.status} label={formatAssistanceStatus(request.status)} />
      </div>
      <UserMiniCard title="发起人" value={`USER_${request.user_id}`} label={userName} />
      <p className="muted small">路线 #{request.route_plan_id}：{routeText}</p>
      <p className="muted small">会合点：{request.meet_point} · {request.contact_note}</p>
      <p className="muted small">
        发起时间：{formatDate(request.request_time)} · 接单志愿者：{helperName}
      </p>
      <TimelineList
        title="接单关系"
        value={request.helper_id ? `HELPER_${request.helper_id}` : "UNCLAIMED"}
        label={request.helper_id ? `志愿者 ${helperName} 已接单` : "等待志愿者接单"}
      />
      {request.blocked_reason ? (
        <div className="blocked-box">
          <StatusBadge value="BLOCKED" label="阻塞中" />
          <p className="blocked-reason">
            {request.blocked_reason}
            {request.blocked_at ? `（${formatDate(request.blocked_at)}）` : ""}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export function AssistancePage() {
  const rows = useAssistanceRequestStore((state) => state.rows);
  const load = useAssistanceRequestStore((state) => state.load);
  const users = useUserProfileStore((state) => state.rows);
  const loadUsers = useUserProfileStore((state) => state.load);
  const routes = useRoutePlanStore((state) => state.rows);
  const loadRoutes = useRoutePlanStore((state) => state.load);

  useEffect(() => {
    void load();
    void loadUsers();
    void loadRoutes();
  }, [load, loadUsers, loadRoutes]);

  const blockedCount = useMemo(
    () => rows.filter((row) => row.blocked_reason !== null).length,
    [rows]
  );
  const { pageRows } = useAssistanceFlow(rows);

  const nameOf = (id: number | null) =>
    id === null ? "暂无志愿者接单" : users.find((user) => user.id === id)?.nickname ?? `志愿者 #${id}`;
  const routeOf = (id: number) => {
    const route = routes.find((row) => row.id === id);
    return route ? `${route.origin_text} → ${route.destination_text}` : `路线 #${id}`;
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>协助调度</h1>
        </div>
        <StatusBadge value={blockedCount > 0 ? "BLOCKED" : "CLEAR"} label={`设施阻塞请求 ${blockedCount} 个`} />
      </div>

      {pageRows.length === 0 ? (
        <EmptyState title="暂无协助请求" />
      ) : (
        <div className="card-grid">
          {pageRows.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              userName={nameOf(request.user_id)}
              helperName={nameOf(request.helper_id)}
              routeText={routeOf(request.route_plan_id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
