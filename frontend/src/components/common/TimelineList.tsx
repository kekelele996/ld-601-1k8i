import { StatusBadge } from "./StatusBadge";

interface Props {
  title?: string;
  value?: string;
  label?: string;
  tone?: "danger" | "warning" | "neutral" | "success";
}

export function TimelineList({ title = "TimelineList", value = "READY", label, tone }: Props) {
  return (
    <div className={"shared-widget" + (tone === "danger" ? " shared-widget--danger" : "")}>
      <strong>{title}</strong>
      <StatusBadge value={value} label={label ?? "—"} tone={tone} />
    </div>
  );
}
