import { StatusBadge } from "./common/StatusBadge";
import { formatRisk, formatAssistanceStatus } from "../utils/formatters";
import { CLAIMED_ASSISTANCE_STATUS, HIGH_RISK_LEVEL } from "../constants/ImpactScope";
import type { DeactivationImpact } from "../types/DeactivationImpact";

// 设施停用影响评估面板：列出受影响的进行中路线与未完成协助请求，设施页与停用弹窗共用。
export function DeactivationImpactPanel({ impact }: { impact: DeactivationImpact }) {
  const { active_routes: activeRoutes, unfinished_requests: unfinishedRequests } = impact;
  return (
    <div className="impact-panel">
      {impact.note_required ? (
        <p className="impact-warning">
          检测到 {impact.high_risk_route_count} 条高风险进行中路线、{impact.claimed_request_count}
          个已接单协助请求，必须填写影响说明后才能停用。
        </p>
      ) : (
        <p className="impact-hint">当前没有高风险进行中路线或已接单请求，可直接确认停用。</p>
      )}

      <h3>受影响进行中路线（{activeRoutes.length}）</h3>
      {activeRoutes.length === 0 ? (
        <p className="empty-inline">暂无引用该设施的进行中路线</p>
      ) : (
        <ul className="impact-list">
          {activeRoutes.map((route) => (
            <li key={route.id} className={route.risk_level === HIGH_RISK_LEVEL ? "danger" : ""}>
              <span className="impact-main">
                #{route.id} {route.origin_text} → {route.destination_text}
              </span>
              <StatusBadge
                value={route.risk_level}
                label={"风险：" + formatRisk(route.risk_level)}
              />
              {route.blocked_reason ? <span className="blocked-reason">{route.blocked_reason}</span> : null}
            </li>
          ))}
        </ul>
      )}

      <h3>受影响未完成协助请求（{unfinishedRequests.length}）</h3>
      {unfinishedRequests.length === 0 ? (
        <p className="empty-inline">暂无未完成协助请求</p>
      ) : (
        <ul className="impact-list">
          {unfinishedRequests.map((request) => {
            const claimed = CLAIMED_ASSISTANCE_STATUS.includes(
              request.status as (typeof CLAIMED_ASSISTANCE_STATUS)[number]
            );
            return (
              <li key={request.id} className={claimed ? "danger" : ""}>
                <span className="impact-main">
                  #{request.id} 路线 #{request.route_plan_id} · 会合点：{request.meet_point}
                </span>
                <StatusBadge value={request.status} label={formatAssistanceStatus(request.status)} />
                <span className="helper">
                  {request.helper_id ? `志愿者 #${request.helper_id} 已接单` : "尚未接单"}
                </span>
                {request.blocked_reason ? <span className="blocked-reason">{request.blocked_reason}</span> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
