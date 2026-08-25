import { apiClient } from '../../../core/network/apiClient';
import { endpoints } from '../../../core/network/endpoints';
import { ApiException } from '../../../core/network/apiException';
import { secureStorage } from '../../../core/storage/secureStorage';
import { AppUser, appUserFromJson } from '../../../shared/models/AppUser';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  kvkkApproved: boolean;
}

export const authRepository = {
  async login(email: string, password: string): Promise<AppUser> {
    try {
      // Login öncesi CSRF akışı: token'ı hem body'de hem httpOnly çerez
      // olarak alıyoruz; RN'in native networking katmanı çerezi otomatik
      // saklayıp login isteğine ekliyor (ekstra cookie-jar paketi gerekmiyor).
      const csrfRes = await apiClient.get(endpoints.csrfToken);
      const csrfToken = csrfRes.data.csrfToken as string;

      const res = await apiClient.post(endpoints.login, { email, password, csrfToken });
      const token = res.data.token as string;
      await secureStorage.saveToken(token);
      return appUserFromJson(res.data.user);
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async register(input: RegisterInput): Promise<void> {
    try {
      await apiClient.post(endpoints.register, {
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        cep_telefonu: input.phone,
        kvkkApproved: input.kvkkApproved,
      });
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post(endpoints.forgotPassword, { email });
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async fetchCurrentUser(token: string): Promise<AppUser | null> {
    try {
      const res = await apiClient.post(endpoints.verifyToken, { token });
      if (!res.data.success) return null;
      return appUserFromJson(res.data.user);
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await secureStorage.deleteToken();
    try {
      await apiClient.post(endpoints.logout);
    } catch {
      // Sunucu tarafı logout best-effort — yerel token zaten silindi.
    }
  },
};
