import type { RequestHandler } from "express";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

type AuthedRequest = Parameters<RequestHandler>[0] & { user?: { id?: number; role?: string } };

// RBAC：authMiddleware 注入 req.user.role（默认 admin）。停用设施仅设施管理员可用。
export const rbacMiddleware = (roles: string[] = []): RequestHandler => (req, res, next) => {
  if (roles.length === 0) return next();
  const role = (req as AuthedRequest).user?.role ?? "admin";
  if (role === "admin" || roles.includes(role)) return next();
  return res.status(403).json({
    code: ERROR_CODES.RBAC_DENIED,
    message: ERROR_MESSAGES.RBAC_DENIED
  });
};
