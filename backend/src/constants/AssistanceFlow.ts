// 协助请求的未完成状态；已接单（helper 已绑定且状态为 ACCEPTED/ARRIVED）属于停用强阻塞
export const OPEN_ASSISTANCE_STATUSES = ["REQUESTED", "ACCEPTED", "ARRIVED"] as const;
// 已接单状态：存在该状态请求时，停用设施必须填写影响说明
export const ACCEPTED_ASSISTANCE_STATUSES = ["ACCEPTED", "ARRIVED"] as const;
// 协助请求终态
export const TERMINAL_ASSISTANCE_STATUSES = ["COMPLETED", "CANCELLED"] as const;
