export interface Listing {
  _id: string;
  category?: string;
  brand?: string;
  model?: string;
  cosmeticCondition?: string;
  hasWarranty?: boolean;
  warrantyDuration?: string;
  hasBox?: boolean;
  hasInvoice?: boolean;
  invoiceDate?: string;
  images?: string[];
  createdAt?: string;
  listing?: {
    price?: number;
    title?: string;
    description?: string;
    date?: string;
  };
}

export function getListingTitle(listing: Listing): string {
  return listing.listing?.title || `${listing.brand || ''} ${listing.model || ''}`.trim() || 'İlan';
}
