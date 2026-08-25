import { theme } from '../../core/theme/theme';
import { SubmissionStatus } from '../../shared/models/Submission';

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Beklemede',
  offered: 'Teklif Verildi',
  listed: 'İlana Dönüştü',
  rejected: 'Reddedildi',
  approved: 'Onaylandı',
  accepted: 'Kabul Edildi',
  customer_accepted: 'Kabul Ettiniz',
  customer_rejected: 'Reddettiniz',
  delivery_confirmed: 'Teslimat Onaylandı',
  delivery_completed: 'Teslimat Tamamlandı',
  cancel_requested: 'İptal İnceleniyor',
  cancelled: 'İptal Edildi',
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: theme.colors.warning,
  offered: theme.colors.primary,
  listed: theme.colors.success,
  rejected: theme.colors.danger,
  approved: theme.colors.success,
  accepted: theme.colors.success,
  customer_accepted: theme.colors.success,
  customer_rejected: theme.colors.danger,
  delivery_confirmed: theme.colors.success,
  delivery_completed: theme.colors.success,
  cancel_requested: theme.colors.warning,
  cancelled: theme.colors.textMuted,
};
