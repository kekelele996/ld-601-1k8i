export const FacilityStatus = ["AVAILABLE","BLOCKED","MAINTENANCE","UNKNOWN","DISABLED"] as const;
export type FacilityStatus = (typeof FacilityStatus)[number];
