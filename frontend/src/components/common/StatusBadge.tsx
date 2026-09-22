import type { CSSProperties } from "react";

interface StatusBadgeProps {
  value: string;
  // 可选中文文案；不传时保持旧行为（展示枚举原文）
  label?: string;
  // 语义色调：停用 / 高风险 / 已接单等跨页面共用
  tone?: "danger" | "warning" | "neutral" | "success";
}

const toneStyle: Record<NonNullable<StatusBadgeProps["tone"]>, CSSProperties> = {
  danger: { background: "#f7e3de", color: "#9d3a28" },
  warning: { background: "#faeeda", color: "#8a5a16" },
  neutral: { background: "#e4e0d3", color: "#4a5048" },
  success: { background: "#e4efe4", color: "#244b31" }
};

export function StatusBadge({ value, label, tone }: StatusBadgeProps) {
  const cls = "badge " + String(value).toLowerCase().replace(/_/g, "-");
  return (
    <span className={cls} style={tone ? toneStyle[tone] : undefined}>
      {label ?? String(value).replace(/_/g, " ")}
    </span>
  );
}
