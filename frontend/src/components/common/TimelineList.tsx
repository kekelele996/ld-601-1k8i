import { StatusBadge } from "./StatusBadge";

export function TimelineList({
  title = "TimelineList",
  value = "READY",
  label
}: {
  title?: string;
  value?: string;
  label?: string;
}) {
  return (
    <div className="shared-widget">
      <strong>{title}</strong>
      <StatusBadge value={value} label={label} />
    </div>
  );
}
