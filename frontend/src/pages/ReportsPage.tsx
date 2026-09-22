import { useEffect, useMemo, useState } from "react";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineList } from "../components/common/TimelineList";
import { EmptyState } from "../components/common/EmptyState";
import { formatFacilityStatus } from "../utils/formatters";
import "./Pages.css";

const VERIFY_TEXT: Record<string, string> = {
  PENDING: "待审核",
  CONFIRMED: "已确认",
  RESOLVED: "已关闭"
};

// 障碍工单：审核状态与设施状态（含停用）联动展示
export function ReportsPage() {
  const { rows, loading, load } = useBarrierReportStore();
  const { rows: facilityRows, load: loadFacilities } = useAccessibleFacilityStore();
  const [verifyFilter, setVerifyFilter] = useState("ALL");

  useEffect(() => {
    void load();
    void loadFacilities();
  }, [load, loadFacilities]);

  const filtered = useMemo(
    () => rows.filter((row) => verifyFilter === "ALL" || row.verify_status === verifyFilter),
    [rows, verifyFilter]
  );

  return (
    <section className="page-panel">
      <header className="page-panel__head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>障碍工单</h1>
          <p className="page-panel__sub">关联设施被停用后，工单中同步显示“已停用”状态。</p>
        </div>
      </header>

      <div className="filter-bar">
        <label>
          审核状态
          <select value={verifyFilter} onChange={(event) => setVerifyFilter(event.target.value)}>
            <option value="ALL">全部状态</option>
            {Object.entries(VERIFY_TEXT).map(([value, text]) => (
              <option key={value} value={value}>{text}</option>
            ))}
          </select>
        </label>
        <span className="filter-bar__count">共 {filtered.length} 条{loading && "（加载中…）"}</span>
      </div>

      {!loading && filtered.length === 0 && <EmptyState title="暂无工单" />}

      <div className="assistance-list">
        {filtered.map((report) => {
          const facility = facilityRows.find((row) => row.id === report.facility_id);
          return (
            <article key={report.id} className="route-card">
              <div className="route-card__head">
                <h3>
                  <span className="link-id">工单 #{report.id}</span>
                  {report.description}
                </h3>
                <div className="route-card__badges">
                  <StatusBadge
                    value={report.verify_status}
                    label={VERIFY_TEXT[report.verify_status] ?? report.verify_status}
                    tone={report.verify_status === "CONFIRMED" ? "warning" : "neutral"}
                  />
                  <StatusBadge value={`PRIORITY_${report.priority}`} label={`优先级 ${report.priority}`} />
                </div>
              </div>
              <TimelineList
                title="关联设施"
                value={facility?.status ?? "UNKNOWN"}
                label={facility ? `${facility.name} · ${formatFacilityStatus(facility.status)}` : "未知设施"}
                tone={facility?.status === "DISABLED" ? "danger" : "neutral"}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
