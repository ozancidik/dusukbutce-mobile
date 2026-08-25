import { create } from 'axios';
import { secureStorage } from '../storage/secureStorage';
import { AUTH_EXEMPT_PATHS } from './endpoints';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://www.dusukbutce.com';

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// authStore, apiClient'ı kullandığı için doğrudan import edip döngüsel
// bağımlılık oluşturmak yerine, store kendini burada kayıt ettiriyor.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const path = error.config?.url as string | undefined;
    const isExempt = path ? AUTH_EXEMPT_PATHS.some((p) => path.includes(p)) : false;
    if (status === 401 && !isExempt) {
      await secureStorage.deleteToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);
