import { apiClient } from '../../../core/network/apiClient';
import { endpoints } from '../../../core/network/endpoints';
import { ApiException } from '../../../core/network/apiException';
import { Listing } from '../../../shared/models/Listing';

export const listingsRepository = {
  async fetchListings(): Promise<Listing[]> {
    try {
      const res = await apiClient.get(endpoints.listings);
      return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },

  async fetchListing(id: string): Promise<Listing> {
    try {
      const res = await apiClient.get(endpoints.listingDetail(id));
      return res.data;
    } catch (e) {
      throw ApiException.fromAxiosError(e);
    }
  },
};
