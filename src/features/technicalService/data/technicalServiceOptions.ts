// dusukbutce.com'daki app/teknik-servis/evimden-al/components/AppointmentSection.tsx
// ve app/teknik-servis/kargo-ile-gonder/components/ShippingOptionsSection.tsx ile
// birebir aynı seçenekler. Değer (value) backend'e (`preferredTime`/`shippingMethod`)
// olduğu gibi gönderilir.
export interface PillOption {
  value: string;
  label: string;
}

export const APPOINTMENT_TIME_SLOTS: string[] = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];

export const SHIPPING_METHOD_OPTIONS: PillOption[] = [
  { value: 'aras', label: 'Aras Kargo (25 TL, 1-2 gün)' },
  { value: 'mng', label: 'MNG Kargo (30 TL, 1-2 gün)' },
  { value: 'yurtici', label: 'Yurtiçi Kargo (35 TL, 2-3 gün)' },
  { value: 'ptt', label: 'PTT Kargo (20 TL, 3-5 gün)' },
];
