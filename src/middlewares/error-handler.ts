import type { Request, Response, NextFunction } from "express";

// Constant
import { STATUS_CODE, VALID_STATUS_CODES } from "@/constants/status-code.ts";

// Types
import { AppError } from "@/types/error.ts";


export const globalErrorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = VALID_STATUS_CODES.has(err.status)
    ? err.status
    : STATUS_CODE.INTERNAL_SERVER_ERROR;

  console.error(err);

  res.status(status).json({ status, errorCode: err.errorCode, message: err.message });
}
