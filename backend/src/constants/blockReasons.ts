// 设施停用后写入未完成协助请求的阻塞原因模板，{name} 由停用设施名称替换
export const BLOCK_REASON_TEMPLATES = {
  FACILITY_DEACTIVATED: "设施「{name}」已停用，路线需重新规划，请等待协调员联系",
  IMPACT_REQUIRED_PREFIX: "停用影响："
} as const;

export const buildFacilityBlockReason = (facilityName: string, impactNote?: string): string => {
  const base = BLOCK_REASON_TEMPLATES.FACILITY_DEACTIVATED.replace("{name}", facilityName);
  const note = impactNote?.trim();
  return note ? `${base}；${BLOCK_REASON_TEMPLATES.IMPACT_REQUIRED_PREFIX}${note}` : base;
};
