import { ERROR_CODES } from "../constants/errorCodes";

export class ServiceError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = status;
  }
}

export const throwServiceError = (
  code: keyof typeof ERROR_CODES,
  message: string,
  status = 400
): never => {
  throw new ServiceError(ERROR_CODES[code], message, status);
};
