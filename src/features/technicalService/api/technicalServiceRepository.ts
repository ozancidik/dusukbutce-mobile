import { apiClient } from '../../../core/network/apiClient';
import { endpoints } from '../../../core/network/endpoints';
import { ApiException } from '../../../core/network/apiException';

// Backend sözleşmesi: ~/Desktop/dusukbutce-web/app/api/technical-service-submissions/route.ts
// POST anonim (auth gerekmiyor), body şekli models/TechnicalServiceSubmission.ts ile birebir.
export type DeliveryMethod = 'evimden-al' | 'kargo-ile-gonder';

export interface TechnicalServiceSubmissionInput {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  serviceType: string;
  deliveryMethod: DeliveryMethod;
  deviceInfo: string;
  problemDescription: string;
  // Sadece deliveryMethod === 'evimden-al' iken anlamlı
  preferredDate?: string;
  preferredTime?: string;
  // Sadece deliveryMethod === 'kargo-ile-gonder' iken anlamlı
  shippingMethod?: string;
  notes?: string;
}

export interface TechnicalServiceSubmissionResult {
  submissionId: string;
  message: string;
}

export const technicalServiceRepository = {
  async submit(data: TechnicalServiceSubmissionInput): Promise<TechnicalServiceSubmissionResult> {
    try {
      const res = await apiClient.post(endpoints.technicalServiceSubmissions, data);
      return { submissionId: res.data.submissionId, message: res.data.message };
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },
};
