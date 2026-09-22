import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ApiErrorBody } from "../types/DeactivationImpact";

// 前端统一错误类型：service 409（缺少影响说明）时页面据此阻止关闭弹窗
export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

// 所有写请求统一经过这里，禁止在组件里散写 fetch 错误结构
export async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, {
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      ...init
    });
  } catch (error) {
    throw new ApiClientError(
      "NETWORK_ERROR",
      `网络异常，请稍后重试：${(error as Error).message}`,
      0
    );
  }
  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    const code = body?.code ?? "SERVER_ERROR";
    throw new ApiClientError(
      code,
      body?.message ??
        ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] ??
        `请求失败（${res.status}）`,
      res.status
    );
  }
  return (await res.json()) as T;
}
