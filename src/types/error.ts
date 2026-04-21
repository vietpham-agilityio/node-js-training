import { ERROR_CODE_WITH_STATUS_CODE, ERROR_MESSAGE_WITH_STATUS_CODE } from "@/constants/error-messages.ts";

export class AppError extends Error {
  private static readonly DEFAULT_STATUS = 500;
  public readonly errorCode: string;

  constructor(
    public readonly status: number,
    message?: string,
  ) {
    super(message ?? ERROR_MESSAGE_WITH_STATUS_CODE[status] ?? ERROR_MESSAGE_WITH_STATUS_CODE[AppError.DEFAULT_STATUS])
    this.errorCode = ERROR_CODE_WITH_STATUS_CODE[status] ?? ERROR_CODE_WITH_STATUS_CODE[AppError.DEFAULT_STATUS];
  }
}
