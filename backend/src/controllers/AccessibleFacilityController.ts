import type { Request, Response } from "express";
import { accessibleFacilityService } from "../services/AccessibleFacilityService";
import { sendControllerError } from "../utils/controllerError";
import type { FacilityDeactivationPayload } from "../types/AccessibleFacilityPayload";

const parseId = (req: Request): number => Number((req.params as { id: string }).id);
const resolveOperator = (req: Request): number => Number((req as unknown as { user?: { id?: number } }).user?.id ?? 1);

export const accessibleFacilityController = {
  list: (_req: Request, res: Response) => {
    try {
      res.json(accessibleFacilityService.list());
    } catch (err) {
      sendControllerError(res, err);
    }
  },
  create: (req: Request, res: Response) => {
    try {
      res.status(201).json(accessibleFacilityService.create(req.body));
    } catch (err) {
      sendControllerError(res, err);
    }
  },
  deactivationImpact: (req: Request, res: Response) => {
    try {
      res.json(accessibleFacilityService.deactivationImpact(parseId(req)));
    } catch (err) {
      sendControllerError(res, err);
    }
  },
  deactivate: (req: Request, res: Response) => {
    try {
      const payload = (req.body ?? {}) as FacilityDeactivationPayload;
      res.status(200).json(
        accessibleFacilityService.deactivate(parseId(req), payload, resolveOperator(req))
      );
    } catch (err) {
      sendControllerError(res, err);
    }
  }
};
