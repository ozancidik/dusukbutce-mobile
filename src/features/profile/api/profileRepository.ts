import { apiClient } from '../../../core/network/apiClient';
import { ApiException } from '../../../core/network/apiException';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  birthDateEdited: boolean;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
}

export const profileRepository = {
  async fetchProfile(): Promise<ProfileData> {
    try {
      const res = await apiClient.get('/api/auth/update-profile');
      return res.data.user;
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async updateProfile(input: UpdateProfileInput): Promise<ProfileData> {
    try {
      const res = await apiClient.put('/api/auth/update-profile', input);
      return res.data.user;
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },
};
