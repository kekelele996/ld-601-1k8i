export const mockData = {
  userProfile: [
    {
      id: 1,
      nickname: "林晓",
      phone: "13800000001",
      mobility_type: "LOW_VISION",
      assistive_device: "盲杖",
      emergency_contact: "13900000001",
      preferred_language: "zh-CN",
      created_at: "2026-06-11T09:00:00Z"
    },
    {
      id: 2,
      nickname: "陈立",
      phone: "13800000002",
      mobility_type: "WHEELCHAIR",
      assistive_device: "手动轮椅",
      emergency_contact: "13900000002",
      preferred_language: "zh-CN",
      created_at: "2026-06-12T09:00:00Z"
    },
    {
      id: 3,
      nickname: "苏婆婆",
      phone: "13800000003",
      mobility_type: "ELDERLY",
      assistive_device: "助行器",
      emergency_contact: "13900000003",
      preferred_language: "zh-CN",
      created_at: "2026-06-13T09:00:00Z"
    }
  ],
  accessibleFacility: [
    {
      id: 1,
      facility_type: "RAMP",
      name: "东门无障碍坡道",
      location_code: "EAST-GATE-RAMP-01",
      floor: "1F",
      status: "AVAILABLE",
      last_checked_at: "2026-09-20T09:00:00Z",
      owner_department: "站务一部",
      note: "东门主入口坡道",
      deactivated_at: null,
      deactivated_by: null,
      deactivation_note: null
    },
    {
      id: 2,
      facility_type: "ELEVATOR",
      name: "1号无障碍电梯",
      location_code: "HALL-ELEVATOR-A",
      floor: "1F-3F",
      status: "AVAILABLE",
      last_checked_at: "2026-09-20T09:10:00Z",
      owner_department: "机电班",
      note: "站厅中部电梯",
      deactivated_at: null,
      deactivated_by: null,
      deactivation_note: null
    },
    {
      id: 3,
      facility_type: "RESTROOM",
      name: "2F无障碍卫生间",
      location_code: "WEST-WING-WC-2F",
      floor: "2F",
      status: "MAINTENANCE",
      last_checked_at: "2026-09-18T14:00:00Z",
      owner_department: "保洁班",
      note: "扶手维修中",
      deactivated_at: null,
      deactivated_by: null,
      deactivation_note: null
    },
    {
      id: 4,
      facility_type: "TACTILE_PAVING",
      name: "站台盲道(B口)",
      location_code: "PLATFORM-B-TACTILE",
      floor: "B1",
      status: "BLOCKED",
      last_checked_at: "2026-09-19T10:30:00Z",
      owner_department: "养护班",
      note: "局部破损待修补",
      deactivated_at: null,
      deactivated_by: null,
      deactivation_note: null
    },
    {
      id: 5,
      facility_type: "LIFT",
      name: "西门轮椅升降平台",
      location_code: "WEST-GATE-LIFT-01",
      floor: "1F",
      status: "AVAILABLE",
      last_checked_at: "2026-09-21T08:45:00Z",
      owner_department: "站务二部",
      note: "西门备用通道",
      deactivated_at: null,
      deactivated_by: null,
      deactivation_note: null
    }
  ],
  routePlan: [
    {
      id: 1,
      user_id: 1,
      origin_text: "东门公交站",
      destination_text: "服务总台",
      route_mode: "WHEELCHAIR_FRIENDLY",
      risk_level: "LOW",
      status: "ACTIVE",
      estimated_minutes: 8,
      facility_ids: [1, 2],
      blocked_reason: null,
      created_at: "2026-09-20T08:00:00Z"
    },
    {
      id: 2,
      user_id: 2,
      origin_text: "东门落客区",
      destination_text: "B1站台",
      route_mode: "STEP_FREE",
      risk_level: "MEDIUM",
      status: "ACTIVE",
      estimated_minutes: 12,
      facility_ids: [1],
      blocked_reason: null,
      created_at: "2026-09-20T08:20:00Z"
    },
    {
      id: 3,
      user_id: 3,
      origin_text: "东门坡道",
      destination_text: "B口站台",
      route_mode: "ASSISTED",
      risk_level: "HIGH",
      status: "ACTIVE",
      estimated_minutes: 15,
      facility_ids: [1, 4],
      blocked_reason: null,
      created_at: "2026-09-20T08:40:00Z"
    },
    {
      id: 4,
      user_id: 1,
      origin_text: "东门公交站",
      destination_text: "服务总台",
      route_mode: "WHEELCHAIR_FRIENDLY",
      risk_level: "LOW",
      status: "FINISHED",
      estimated_minutes: 9,
      facility_ids: [1],
      blocked_reason: null,
      created_at: "2026-09-10T08:00:00Z"
    },
    {
      id: 5,
      user_id: 2,
      origin_text: "西门",
      destination_text: "2F候车区",
      route_mode: "STEP_FREE",
      risk_level: "LOW",
      status: "ACTIVE",
      estimated_minutes: 10,
      facility_ids: [5, 2],
      blocked_reason: null,
      created_at: "2026-09-21T07:30:00Z"
    }
  ],
  assistanceRequest: [
    {
      id: 1,
      user_id: 1,
      route_plan_id: 1,
      helper_id: null,
      request_time: "2026-09-21T08:00:00Z",
      status: "REQUESTED",
      meet_point: "东门坡道入口",
      contact_note: "到站请电话联系",
      blocked_reason: null,
      blocked_at: null
    },
    {
      id: 2,
      user_id: 2,
      route_plan_id: 2,
      helper_id: 2,
      request_time: "2026-09-21T08:10:00Z",
      status: "ACCEPTED",
      meet_point: "东门落客区",
      contact_note: "志愿者持蓝色马甲",
      blocked_reason: null,
      blocked_at: null
    },
    {
      id: 3,
      user_id: 3,
      route_plan_id: 3,
      helper_id: 3,
      request_time: "2026-09-21T08:20:00Z",
      status: "ARRIVED",
      meet_point: "东门坡道顶端",
      contact_note: "已到达会合点",
      blocked_reason: null,
      blocked_at: null
    },
    {
      id: 4,
      user_id: 1,
      route_plan_id: 4,
      helper_id: 2,
      request_time: "2026-09-10T08:00:00Z",
      status: "COMPLETED",
      meet_point: "东门坡道入口",
      contact_note: "已完成",
      blocked_reason: null,
      blocked_at: null
    },
    {
      id: 5,
      user_id: 2,
      route_plan_id: 5,
      helper_id: null,
      request_time: "2026-09-21T08:30:00Z",
      status: "REQUESTED",
      meet_point: "西门升降平台",
      contact_note: "携带大件行李",
      blocked_reason: null,
      blocked_at: null
    }
  ],
  barrierReport: [
    {
      id: 1,
      reporter_id: 1,
      facility_id: 4,
      barrier_type: "TACTILE_DAMAGE",
      description: "盲道砖块翘起",
      photo_url: "/mock/photo_url-1.png",
      verify_status: "VERIFIED",
      priority: "HIGH"
    },
    {
      id: 2,
      reporter_id: 2,
      facility_id: 3,
      barrier_type: "RAIL_LOOSE",
      description: "扶手松动",
      photo_url: "/mock/photo_url-2.png",
      verify_status: "PENDING",
      priority: "MEDIUM"
    },
    {
      id: 3,
      reporter_id: 3,
      facility_id: 1,
      barrier_type: "SLOPE_SLIPPERY",
      description: "雨天坡面湿滑",
      photo_url: "/mock/photo_url-3.png",
      verify_status: "CLOSED",
      priority: "LOW"
    }
  ]
};
