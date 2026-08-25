import { AxiosError } from 'axios';

export class ApiException extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
  }

  static fromAxiosError(error: unknown): ApiException {
    if (error instanceof AxiosError) {
      const data = error.response?.data as { error?: string; message?: string } | undefined;
      const message = data?.error || data?.message || 'Beklenmeyen bir hata oluştu';
      return new ApiException(message, error.response?.status);
    }
    return new ApiException('Beklenmeyen bir hata oluştu');
  }
}
