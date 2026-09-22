import { StatusBadge } from "./StatusBadge";
import { formatRisk } from "../../utils/formatters";

export function RouteRiskPanel({
  title = "RouteRiskPanel",
  value = "READY",
  blockedReason
}: {
  title?: string;
  value?: string;
  split?: boolean;
  blockedReason?: string | null;
}) {
  return (
    <div className={"shared-widget risk-" + String(value).toLowerCase()}>
      <strong>{title}</strong>
      <StatusBadge value={value} label={"风险：" + formatRisk(value)} />
      {blockedReason ? <p className="blocked-reason">阻塞说明：{blockedReason}</p> : null}
    </div>
  );
}
