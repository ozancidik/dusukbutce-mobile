import { apiClient } from '../../../core/network/apiClient';
import { ApiException } from '../../../core/network/apiException';
import { Address } from '../../../shared/models/Address';

export const addressesRepository = {
  async fetchAll(): Promise<Address[]> {
    try {
      const res = await apiClient.get('/api/addresses');
      return res.data.addresses ?? [];
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async create(address: Address): Promise<void> {
    try {
      await apiClient.post('/api/addresses', address);
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async update(addressId: string, address: Address): Promise<void> {
    try {
      await apiClient.put('/api/addresses', { addressId, ...address });
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async remove(addressId: string): Promise<void> {
    try {
      await apiClient.delete('/api/addresses', { params: { addressId } });
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },
};
