import { apiClient } from '../../../core/network/apiClient';
import { ApiException } from '../../../core/network/apiException';
import { Submission } from '../../../shared/models/Submission';

export const offersRepository = {
  async fetchMyOffers(): Promise<Submission[]> {
    try {
      const res = await apiClient.get('/api/submissions');
      return res.data.submissions ?? [];
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async respond(id: string, action: 'accepted' | 'rejected', note?: string): Promise<void> {
    try {
      await apiClient.put(`/api/submissions/${id}/response`, { action, note, reason: note });
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async reoffer(id: string, reofferNote: string): Promise<void> {
    try {
      await apiClient.put(`/api/submissions/${id}/reoffer`, { reofferNote });
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async cancel(id: string, reason?: string): Promise<void> {
    try {
      await apiClient.put(`/api/submissions/${id}/cancel`, { reason });
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },
};
