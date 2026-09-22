import { StatusBadge } from "./StatusBadge";
import { formatFacilityStatus } from "../../utils/formatters";

export function FacilityTag({
  title = "FacilityTag",
  value = "AVAILABLE"
}: {
  title?: string;
  value?: string;
}) {
  return (
    <div className="shared-widget">
      <strong>{title}</strong>
      <StatusBadge value={value} label={formatFacilityStatus(value)} />
    </div>
  );
}
