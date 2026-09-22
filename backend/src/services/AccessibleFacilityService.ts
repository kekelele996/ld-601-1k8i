import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { deactivationImpactService } from "./DeactivationImpactService";
import type { FacilityDeactivationPayload } from "../types/AccessibleFacilityPayload";

export const accessibleFacilityService = {
  list: () => accessibleFacilityRepository.findAll(),
  create: (row: unknown) => accessibleFacilityRepository.save(row),
  deactivationImpact: (facilityId: number) => deactivationImpactService.scan(facilityId),
  deactivate: (facilityId: number, payload: FacilityDeactivationPayload, operatorId: number) =>
    deactivationImpactService.deactivate(facilityId, payload.impact_note, operatorId)
};
