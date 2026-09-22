export const LOG_TEMPLATES = {
  UserProfile: ["UserProfile.create", "UserProfile.update", "UserProfile.status", "UserProfile.export"],
  AccessibleFacility: [
    "AccessibleFacility.create",
    "AccessibleFacility.update",
    "AccessibleFacility.status",
    "AccessibleFacility.export",
    "AccessibleFacility.deactivateScan",
    "AccessibleFacility.deactivate",
    "AccessibleFacility.deactivateRejected"
  ],
  RoutePlan: ["RoutePlan.create", "RoutePlan.update", "RoutePlan.status", "RoutePlan.export", "RoutePlan.riskEscalated"],
  AssistanceRequest: ["AssistanceRequest.create", "AssistanceRequest.update", "AssistanceRequest.status", "AssistanceRequest.export", "AssistanceRequest.blockedByFacility"],
  BarrierReport: ["BarrierReport.create", "BarrierReport.update", "BarrierReport.status", "BarrierReport.export"]
};
