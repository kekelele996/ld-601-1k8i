import { ERROR_CODES } from "../constants/errorCodes";

// service / controller 之间传递的业务异常，最终由 errorHandlerMiddleware 统一出参
export class BusinessError extends Error {
  code: string;
  status: number;

  constructor(code: keyof typeof ERROR_CODES, message: string, status = 400) {
    super(message);
    this.name = "BusinessError";
    this.code = ERROR_CODES[code];
    this.status = status;
  }
}

// controller 层对未知异常的二次包装，禁止在全局错误处理里吞掉上下文
export class ControllerError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "CONTROLLER_ERROR", status = 500) {
    super(message);
    this.name = "ControllerError";
    this.code = code;
    this.status = status;
  }
}
