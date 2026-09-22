import { Router } from "express";
import { accessibleFacilityController } from "../controllers/AccessibleFacilityController";

const router = Router();

router.get("/", accessibleFacilityController.list);
router.post("/", accessibleFacilityController.create);
// 停用前影响评估：扫描进行中路线与未完成协助请求
router.get("/:id/deactivation-impact", accessibleFacilityController.deactivationImpact);
// 确认停用：携带影响说明，整次成功或整次拒绝
router.post("/:id/deactivate", accessibleFacilityController.deactivate);

export default router;
