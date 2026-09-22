import type { Request, Response, NextFunction } from "express";
import { accessibleFacilityService } from "../services/AccessibleFacilityService";
import { BusinessError, ControllerError } from "../errors/BusinessError";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { DeactivatePayload } from "../types/DeactivationImpact";

const parseFacilityId = (req: Request): number => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ControllerError("invalid facility id", "VALIDATION_FAILED", 400);
  }
  return id;
};

// service 异常（BusinessError）与 controller 自身的参数异常（ControllerError）原样透传，
// 仅对意外异常二次包装，禁止在全局错误处理里吞掉上下文。
const toNextError = (prefix: string, error: unknown) =>
  error instanceof BusinessError || error instanceof ControllerError
    ? error
    : new ControllerError(`${prefix}: ${(error as Error).message}`);

export const accessibleFacilityController = {
  list: (_req: Request, res: Response) =>
    res.json(accessibleFacilityService.list()),

  create: (req: Request, res: Response) =>
    res.status(201).json(accessibleFacilityService.create(req.body)),

  // GET /api/accessible-facility/:id/deactivation-impact —— 停用影响评估扫描
  deactivationImpact(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseFacilityId(req);
      res.json(accessibleFacilityService.assessDeactivationImpact(id));
    } catch (error) {
      next(toNextError("停用影响扫描失败", error));
    }
  },

  // PATCH /api/accessible-facility/:id/deactivate —— 巡检员确认停用
  deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseFacilityId(req);
      const payload = (req.body ?? {}) as DeactivatePayload;
      const actorId = (req as Request & { user?: { id?: number } }).user?.id;
      console.info("audit", LOG_TEMPLATES.AccessibleFacility[2], {
        facility_id: id,
        actor_id: actorId
      });
      const result = accessibleFacilityService.deactivate(id, payload, actorId);
      // 首次确认与重复提交（幂等跳过）均返回 200，body 中 already_processed 区分
      res.status(200).json(result);
    } catch (error) {
      next(toNextError("设施停用处理失败", error));
    }
  }
};
