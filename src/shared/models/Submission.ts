export type SubmissionStatus =
  | 'pending'
  | 'offered'
  | 'listed'
  | 'rejected'
  | 'approved'
  | 'accepted'
  | 'customer_accepted'
  | 'customer_rejected'
  | 'delivery_confirmed'
  | 'delivery_completed'
  | 'cancel_requested'
  | 'cancelled';

export interface Submission {
  _id: string;
  category?: string;
  brand?: string;
  model?: string;
  submissionNumber?: string;
  status: SubmissionStatus;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  offer?: {
    amount?: number;
    notes?: string;
    date?: string;
  };
  cancellation?: {
    reason?: string;
    requestedAt?: string;
  };
}
