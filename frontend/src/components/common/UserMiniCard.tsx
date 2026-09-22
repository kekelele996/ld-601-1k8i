import { StatusBadge } from "./StatusBadge";

interface Props {
  title?: string;
  value?: string;
  label?: string;
  tone?: "danger" | "warning" | "neutral" | "success";
}

export function UserMiniCard({ title = "UserMiniCard", value = "READY", label, tone }: Props) {
  return (
    <div className="shared-widget shared-widget--inline">
      <strong>{title}</strong>
      <StatusBadge value={value} label={label} tone={tone} />
    </div>
  );
}
