export const LOG_TEMPLATES = {
  UserProfile: ["UserProfile.create", "UserProfile.update", "UserProfile.status", "UserProfile.export"],
  AccessibleFacility: [
    "AccessibleFacility.create",
    "AccessibleFacility.update",
    "AccessibleFacility.status",
    "AccessibleFacility.export",
    "AccessibleFacility.deactivateImpactScan",
    "AccessibleFacility.deactivateRejected",
    "AccessibleFacility.deactivateConfirmed",
    "AccessibleFacility.deactivateDuplicateSkipped"
  ],
  RoutePlan: [
    "RoutePlan.create",
    "RoutePlan.update",
    "RoutePlan.status",
    "RoutePlan.export",
    "RoutePlan.riskEscalatedByFacilityDeactivation"
  ],
  AssistanceRequest: [
    "AssistanceRequest.create",
    "AssistanceRequest.update",
    "AssistanceRequest.status",
    "AssistanceRequest.export",
    "AssistanceRequest.blockedByFacilityDeactivation"
  ],
  BarrierReport: ["BarrierReport.create", "BarrierReport.update", "BarrierReport.status", "BarrierReport.export"]
};
