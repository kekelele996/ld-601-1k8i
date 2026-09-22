import { Router } from "express";
import { accessibleFacilityController } from "../controllers/AccessibleFacilityController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

// 停用影响评估：巡检员 / 设施管理员可见；确认停用需 FACILITY_INSPECTOR 角色
router.get("/", accessibleFacilityController.list);
router.post("/", accessibleFacilityController.create);
router.get(
  "/:id/deactivation-impact",
  rbacMiddleware(["FACILITY_INSPECTOR", "FACILITY_ADMIN"]),
  accessibleFacilityController.deactivationImpact
);
router.patch(
  "/:id/deactivate",
  rbacMiddleware(["FACILITY_INSPECTOR", "FACILITY_ADMIN"]),
  accessibleFacilityController.deactivate
);

export default router;
