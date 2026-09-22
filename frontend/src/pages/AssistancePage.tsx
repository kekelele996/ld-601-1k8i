import { useEffect, useMemo, useState } from "react";
import { useAssistanceRequestStore } from "../stores/AssistanceRequestStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useUserProfileStore } from "../stores/UserProfileStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { UserMiniCard } from "../components/common/UserMiniCard";
import { EmptyState } from "../components/common/EmptyState";
import { formatAssistanceStatus, formatBlockReason } from "../utils/formatters";
import { AssistanceStatus } from "../constants/AssistanceStatus";
import "./Pages.css";

// 协助调度：设施停用后未完成请求显示阻塞原因；已接单请求保留志愿者接单关系
export function AssistancePage() {
  const { rows, loading, load } = useAssistanceRequestStore();
  const { rows: routeRows, load: loadRoutes } = useRoutePlanStore();
  const { rows: userRows, load: loadUsers } = useUserProfileStore();
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    void load();
    void loadRoutes();
    void loadUsers();
  }, [load, loadRoutes, loadUsers]);

  const filtered = useMemo(
    () => rows.filter((row) => statusFilter === "ALL" || row.status === statusFilter),
    [rows, statusFilter]
  );

  const nicknameOf = (id: number | null) =>
    id === null ? "未分配志愿者" : userRows.find((row) => row.id === id)?.nickname ?? `志愿者 #${id}`;

  return (
    <section className="page-panel">
      <header className="page-panel__head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>协助调度</h1>
          <p className="page-panel__sub">设施停用只会写入阻塞原因，不会取消请求或解除志愿者接单关系。</p>
        </div>
      </header>

      <div className="filter-bar">
        <label>
          请求状态
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">全部状态</option>
            {AssistanceStatus.map((value) => (
              <option key={value} value={value}>{formatAssistanceStatus(value)}</option>
            ))}
          </select>
        </label>
        <span className="filter-bar__count">共 {filtered.length} 条{loading && "（加载中…）"}</span>
      </div>

      {!loading && filtered.length === 0 && <EmptyState title="暂无协助请求" />}

      <div className="assistance-list">
        {filtered.map((request) => {
          const route = routeRows.find((row) => row.id === request.route_plan_id);
          const blocked = request.block_reason !== null;
          return (
            <article key={request.id} className={"assistance-card" + (blocked ? " assistance-card--blocked" : "")}>
              <div className="assistance-card__head">
                <h3><span className="link-id">请求 #{request.id}</span>{request.meet_point}</h3>
                <div className="route-card__badges">
                  <StatusBadge
                    value={request.status}
                    label={formatAssistanceStatus(request.status)}
                    tone={blocked ? "danger" : request.status === "COMPLETED" ? "neutral" : "success"}
                  />
                  {blocked && <StatusBadge value="BLOCKED_BY_FACILITY" label="设施阻塞" tone="warning" />}
                </div>
              </div>

              <p className="route-card__meta">
                路线 #{request.route_plan_id}
                {route ? `（${route.origin_text} → ${route.destination_text}）` : ""} ·{" "}
                联系方式：{request.contact_note}
              </p>

              <div className="assistance-card__people">
                <UserMiniCard
                  title={`乘客：${nicknameOf(request.user_id)}`}
                  value={`USER_${request.user_id}`}
                />
                <UserMiniCard
                  title={`${request.helper_id !== null ? "接单志愿者（保留）" : "志愿者"}：${nicknameOf(request.helper_id)}`}
                  value={request.helper_id !== null ? "HELPER_BOUND" : "HELPER_NONE"}
                  label={request.helper_id !== null ? `#${request.helper_id} 已接单` : "待接单"}
                  tone={request.helper_id !== null ? "success" : "neutral"}
                />
              </div>

              <TimelineList
                title="阻塞原因"
                value={blocked ? "BLOCKED" : "CLEAR"}
                label={formatBlockReason(request.block_reason)}
                tone={blocked ? "danger" : "neutral"}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
