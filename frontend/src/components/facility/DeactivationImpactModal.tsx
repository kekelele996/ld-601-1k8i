import { useEffect } from "react";
import { useDeactivationImpact } from "../../hooks/useDeactivationImpact";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import {
  formatRisk,
  formatRouteStatus,
  formatAssistanceStatus,
  formatFacilityStatus
} from "../../utils/formatters";
import { StatusBadge } from "../common/StatusBadge";
import "./DeactivationImpactModal.css";

interface Props {
  facilityId: number;
  onClose: () => void;
  // 确认成功（或幂等命中）后通知页面刷新设施/路线/协助列表
  onConfirmed: () => Promise<void> | void;
}

// 停用影响评估弹窗：扫描引用设施的进行中路线和未完成协助请求；
// 存在高风险路线或已接单请求时必须填写影响说明，否则整次拒绝（后端返回 409）。
export function DeactivationImpactModal({ facilityId, onClose, onConfirmed }: Props) {
  const {
    impact,
    impactNote,
    setImpactNote,
    scanning,
    submitting,
    error,
    scan,
    confirm
  } = useDeactivationImpact();

  useEffect(() => {
    void scan(facilityId);
  }, [facilityId, scan]);

  const handleConfirm = async () => {
    const result = await confirm(facilityId);
    if (result) {
      await onConfirmed();
    }
  };

  const noteRequired = impact?.impact_note_required ?? false;
  const noteMissing = noteRequired && impactNote.trim().length === 0;

  return (
    <div className="dimask" role="dialog" aria-modal="true" aria-label="停用影响评估">
      <div className="dimask__panel">
        <header className="dimask__head">
          <h3>停用影响评估</h3>
          <button type="button" className="dimask__close" onClick={onClose} disabled={submitting}>
            ×
          </button>
        </header>

        {scanning && <div className="dimask__hint">正在扫描引用该设施的路线与协助请求…</div>}

        {impact && (
          <div className="dimask__body">
            <p className="dimask__facility">
              设施：<strong>{impact.facility_name}</strong>
              <StatusBadge
                value={impact.facility_status}
                label={formatFacilityStatus(impact.facility_status)}
                tone={impact.already_disabled ? "danger" : "neutral"}
              />
              {impact.already_disabled && <StatusBadge value="ALREADY_DISABLED" label="已完成停用" tone="warning" />}
            </p>

            <div className="dimask__stats">
              <span>进行中路线 {impact.active_routes.length} 条</span>
              <span className={impact.high_risk_route_count > 0 ? "dimask__danger" : ""}>
                高风险 {impact.high_risk_route_count} 条
              </span>
              <span>未完成协助 {impact.open_request_count} 条</span>
              <span className={impact.accepted_request_count > 0 ? "dimask__danger" : ""}>
                已接单 {impact.accepted_request_count} 条
              </span>
            </div>

            <section className="dimask__section">
              <h4>受影响的进行中路线</h4>
              {impact.active_routes.length === 0 && <p className="dimask__empty">暂无进行中路线</p>}
              <ul className="dimask__list">
                {impact.active_routes.map((route) => (
                  <li key={route.id}>
                    <span className="dimask__route-id">#{route.id}</span>
                    <span className="dimask__route-text">
                      {route.origin_text} → {route.destination_text}
                    </span>
                    <StatusBadge
                      value={route.status}
                      label={formatRouteStatus(route.status)}
                      tone={route.high_risk ? "danger" : "success"}
                    />
                    <span className={route.high_risk ? "dimask__danger" : ""}>
                      风险：{formatRisk(route.risk_level)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="dimask__section">
              <h4>未完成协助请求（保留接单关系）</h4>
              {impact.open_requests.length === 0 && <p className="dimask__empty">暂无未完成请求</p>}
              <ul className="dimask__list">
                {impact.open_requests.map((request) => (
                  <li key={request.id}>
                    <span className="dimask__route-id">请求 #{request.id}</span>
                    <span className="dimask__route-text">路线 #{request.route_plan_id} · {request.meet_point}</span>
                    <StatusBadge
                      value={request.status}
                      label={formatAssistanceStatus(request.status)}
                      tone={request.accepted ? "warning" : "neutral"}
                    />
                    {request.accepted && <StatusBadge value="ACCEPTED" label="已接单" tone="danger" />}
                  </li>
                ))}
              </ul>
            </section>

            {impact.already_disabled ? (
              <div className="dimask__note-line">
                该设施已完成停用评估，重复提交只处理一次；阻塞说明保持首次结果。
              </div>
            ) : (
              <label className="dimask__field">
                <span>
                  影响说明
                  {noteRequired && <em className="dimask__required">（存在高风险路线或已接单请求，必填）</em>}
                </span>
                <textarea
                  value={impactNote}
                  onChange={(event) => setImpactNote(event.target.value)}
                  rows={3}
                  placeholder="例如：东门坡道封闭施工，轮椅乘客改走西门，已通知志愿者绕行"
                  disabled={submitting}
                />
              </label>
            )}

            {error && (
              <p className="dimask__error" role="alert">
                {error}
              </p>
            )}
            {noteMissing && !error && (
              <p className="dimask__error" role="alert">
                {ERROR_MESSAGES.IMPACT_NOTE_REQUIRED}
              </p>
            )}

            <footer className="dimask__foot">
              <button type="button" onClick={onClose} disabled={submitting}>
                取消
              </button>
              <button
                type="button"
                className="dimask__primary"
                onClick={handleConfirm}
                disabled={submitting || scanning || (!impact.already_disabled && noteMissing)}
              >
                {submitting ? "处理中…" : impact.already_disabled ? "重复提交（幂等）" : "确认停用"}
              </button>
            </footer>
          </div>
        )}

        {!scanning && !impact && error && (
          <div className="dimask__body">
            <p className="dimask__error" role="alert">{error}</p>
            <footer className="dimask__foot">
              <button type="button" onClick={onClose}>关闭</button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
