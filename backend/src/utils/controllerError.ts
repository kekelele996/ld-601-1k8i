import type { Response } from "express";
import { ServiceError } from "./serviceError";

export const sendControllerError = (res: Response, err: unknown) => {
  if (err instanceof ServiceError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "controller error";
  res.status(500).json({ code: "INTERNAL_ERROR", message });
};
