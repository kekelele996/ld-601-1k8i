// 前端离线评审兜底数据，结构与后端 seed.ts 保持一致；API 不可用时按快照返回。
export const buildMockData = () => ({
  userProfile: [
    {
      id: 1,
      nickname: "林晓",
      phone: "13800000001",
      mobility_type: "LOW_VISION",
      assistive_device: "盲杖",
      emergency_contact: "林父 13900000001",
      preferred_language: "zh-CN",
      created_at: "2026-06-11T09:00:00Z"
    },
    {
      id: 2,
      nickname: "陈铎",
      phone: "13800000002",
      mobility_type: "WHEELCHAIR",
      assistive_device: "手动轮椅",
      emergency_contact: "陈母 13900000002",
      preferred_language: "zh-CN",
      created_at: "2026-06-12T09:00:00Z"
    },
    {
      id: 3,
      nickname: "苏奶奶",
      phone: "13800000003",
      mobility_type: "ELDERLY",
      assistive_device: "助行器",
      emergency_contact: "苏叔叔 13900000003",
      preferred_language: "zh-CN",
      created_at: "2026-06-13T09:00:00Z"
    }
  ],
  accessibleFacility: [
    {
      id: 1,
      facility_type: "WHEELCHAIR",
      name: "东门无障碍坡道",
      location_code: "GATE-E-RAMP-01",
      floor: "1F",
      status: "AVAILABLE",
      last_checked_at: "2026-09-20T09:00:00Z",
      owner_department: "场站运维一组",
      note: "东门主出入口坡道",
      deactivation_note: null as string | null,
      deactivated_at: null as string | null,
      deactivated_by: null as number | null
    },
    {
      id: 2,
      facility_type: "WHEELCHAIR",
      name: "B 座无障碍电梯",
      location_code: "TOWER-B-LIFT-02",
      floor: "1F-3F",
      status: "AVAILABLE",
      last_checked_at: "2026-09-19T14:30:00Z",
      owner_department: "电梯维保班",
      note: "连接一层候车厅与三层站台",
      deactivation_note: null as string | null,
      deactivated_at: null as string | null,
      deactivated_by: null as number | null
    },
    {
      id: 3,
      facility_type: "BLIND",
      name: "主通道盲道",
      location_code: "HALL-TACTILE-03",
      floor: "1F",
      status: "MAINTENANCE",
      last_checked_at: "2026-09-18T10:00:00Z",
      owner_department: "场站运维二组",
      note: "中段盲道翻修中",
      deactivation_note: null as string | null,
      deactivated_at: null as string | null,
      deactivated_by: null as number | null
    },
    {
      id: 4,
      facility_type: "ELDERLY",
      name: "一层无障碍卫生间",
      location_code: "TOILET-1F-BARRIERFREE",
      floor: "1F",
      status: "BLOCKED",
      last_checked_at: "2026-09-17T16:20:00Z",
      owner_department: "保洁班组",
      note: "门把手损坏待换",
      deactivation_note: null as string | null,
      deactivated_at: null as string | null,
      deactivated_by: null as number | null
    }
  ],
  routePlan: [
    {
      id: 1,
      user_id: 1,
      origin_text: "东门公交站",
      destination_text: "一层服务中心",
      route_mode: "WHEELCHAIR",
      risk_level: "LOW",
      status: "IN_PROGRESS",
      estimated_minutes: 12,
      facility_ids: [1],
      block_reason: null as string | null,
      created_at: "2026-09-21T08:30:00Z"
    },
    {
      id: 2,
      user_id: 2,
      origin_text: "P2 无障碍车位",
      destination_text: "三层 3 站台",
      route_mode: "WHEELCHAIR",
      risk_level: "HIGH",
      status: "IN_PROGRESS",
      estimated_minutes: 25,
      facility_ids: [1, 2],
      block_reason: null as string | null,
      created_at: "2026-09-21T09:10:00Z"
    },
    {
      id: 3,
      user_id: 3,
      origin_text: "东门公交站",
      destination_text: "二层爱心候车区",
      route_mode: "ELDERLY",
      risk_level: "MEDIUM",
      status: "COMPLETED",
      estimated_minutes: 18,
      facility_ids: [1],
      block_reason: null as string | null,
      created_at: "2026-09-10T07:50:00Z"
    },
    {
      id: 4,
      user_id: 1,
      origin_text: "一层服务中心",
      destination_text: "三层 1 站台",
      route_mode: "WHEELCHAIR",
      risk_level: "MEDIUM",
      status: "IN_PROGRESS",
      estimated_minutes: 20,
      facility_ids: [2],
      block_reason: null as string | null,
      created_at: "2026-09-21T09:40:00Z"
    },
    {
      id: 5,
      user_id: 2,
      origin_text: "西门出租车上客区",
      destination_text: "一层无障碍卫生间",
      route_mode: "WHEELCHAIR",
      risk_level: "LOW",
      status: "CANCELLED",
      estimated_minutes: 9,
      facility_ids: [4],
      block_reason: null as string | null,
      created_at: "2026-09-15T11:00:00Z"
    }
  ],
  assistanceRequest: [
    {
      id: 1,
      user_id: 1,
      route_plan_id: 1,
      helper_id: null as number | null,
      request_time: "2026-09-21T08:35:00Z",
      status: "REQUESTED",
      meet_point: "东门公交站遮阳棚",
      contact_note: "视障乘客，需要引导至服务中心",
      block_reason: null as string | null,
      blocked_by_facility_id: null as number | null
    },
    {
      id: 2,
      user_id: 2,
      route_plan_id: 2,
      helper_id: 2,
      request_time: "2026-09-21T09:15:00Z",
      status: "ACCEPTED",
      meet_point: "P2 无障碍车位 C-08",
      contact_note: "轮椅乘客，需协助搭乘电梯",
      block_reason: null as string | null,
      blocked_by_facility_id: null as number | null
    },
    {
      id: 3,
      user_id: 3,
      route_plan_id: 3,
      helper_id: 3,
      request_time: "2026-09-10T07:55:00Z",
      status: "COMPLETED",
      meet_point: "东门公交站",
      contact_note: "已完成",
      block_reason: null as string | null,
      blocked_by_facility_id: null as number | null
    },
    {
      id: 4,
      user_id: 1,
      route_plan_id: 4,
      helper_id: 3,
      request_time: "2026-09-21T09:45:00Z",
      status: "ARRIVED",
      meet_point: "一层服务中心门口",
      contact_note: "志愿者已到达，等待乘客",
      block_reason: null as string | null,
      blocked_by_facility_id: null as number | null
    },
    {
      id: 5,
      user_id: 2,
      route_plan_id: 5,
      helper_id: 2,
      request_time: "2026-09-15T11:05:00Z",
      status: "CANCELLED",
      meet_point: "西门出租车上客区",
      contact_note: "乘客取消",
      block_reason: null as string | null,
      blocked_by_facility_id: null as number | null
    }
  ],
  barrierReport: [
    {
      id: 1,
      reporter_id: 1,
      facility_id: 3,
      barrier_type: "LOW_VISION",
      description: "主通道盲道中段被施工围挡占用",
      photo_url: "/mock/photo_url-1.png",
      verify_status: "CONFIRMED",
      priority: "HIGH"
    },
    {
      id: 2,
      reporter_id: 2,
      facility_id: 4,
      barrier_type: "WHEELCHAIR",
      description: "无障碍卫生间门把手松动，无法关门",
      photo_url: "/mock/photo_url-2.png",
      verify_status: "PENDING",
      priority: "MEDIUM"
    },
    {
      id: 3,
      reporter_id: 3,
      facility_id: 1,
      barrier_type: "ELDERLY",
      description: "坡道入口提示牌字迹模糊",
      photo_url: "/mock/photo_url-3.png",
      verify_status: "RESOLVED",
      priority: "LOW"
    }
  ]
});

export type MockData = ReturnType<typeof buildMockData>;

export const mockData: MockData = buildMockData();
