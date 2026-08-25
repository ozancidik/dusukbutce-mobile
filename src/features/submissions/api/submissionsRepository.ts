import { apiClient } from '../../../core/network/apiClient';
import { endpoints } from '../../../core/network/endpoints';
import { ApiException } from '../../../core/network/apiException';
import { CategoryFormConfig } from '../config/categoryFormConfigs';

export interface SubmissionResult {
  id: string;
  submissionNumber: string;
}

export const submissionsRepository = {
  async uploadImage(base64DataUrl: string): Promise<string> {
    try {
      const res = await apiClient.post(endpoints.upload, { image: base64DataUrl });
      return res.data.url as string;
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async submit(config: CategoryFormConfig, data: Record<string, unknown>): Promise<SubmissionResult> {
    try {
      const res = await apiClient.post(config.endpoint, { ...data, category: config.id });
      return { id: res.data.id, submissionNumber: res.data.submissionNumber };
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },
};
