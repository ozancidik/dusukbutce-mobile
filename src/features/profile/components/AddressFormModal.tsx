import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';
import { Address } from '../../../shared/models/Address';
import { PickerModal } from './PickerModal';
import { TURKEY_PROVINCES } from '../data/turkeyProvinces';

interface Props {
  visible: boolean;
  initial?: Address | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (address: Address) => void;
}

const EMPTY: Address = { title: '', fullName: '', phone: '', address: '', city: '', district: '', postalCode: '', isDefault: false };
const PROVINCES = Object.keys(TURKEY_PROVINCES);

export function AddressFormModal({ visible, initial, isSubmitting, onCancel, onSubmit }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {/* key, formu her açılışta (yeni adres ya da farklı bir adres
              düzenlerken) taze state ile yeniden mount eder — effect+setState
              senkronizasyonuna gerek kalmaz. */}
          {visible ? (
            <AddressFormBody
              key={initial?._id ?? 'new'}
              initial={initial}
              isSubmitting={isSubmitting}
              onCancel={onCancel}
              onSubmit={onSubmit}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddressFormBody({
  initial,
  isSubmitting,
  onCancel,
  onSubmit,
}: Omit<Props, 'visible'>) {
  const [form, setForm] = useState<Address>(initial ?? EMPTY);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [districtPickerOpen, setDistrictPickerOpen] = useState(false);

  const set = (key: keyof Address) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const districtOptions = form.city ? TURKEY_PROVINCES[form.city] ?? [] : [];

  const handleSubmit = () => {
    if (!form.title.trim() || !form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.district.trim()) {
      return;
    }
    onSubmit(form);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{initial ? 'Adresi Düzenle' : 'Yeni Adres'}</Text>
        <AppTextInput label="Başlık (Ev, İş vb.)" value={form.title} onChangeText={set('title')} />
        <AppTextInput label="Ad Soyad" value={form.fullName} onChangeText={set('fullName')} />
        <AppTextInput label="Telefon" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
        <AppTextInput label="Adres" value={form.address} onChangeText={set('address')} multiline style={styles.textarea} />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Pressable style={styles.selectField} onPress={() => setCityPickerOpen(true)}>
              <Text style={styles.selectLabel}>İl</Text>
              <Text style={form.city ? styles.selectValue : styles.selectPlaceholder}>{form.city || 'Seçin'}</Text>
            </Pressable>
          </View>
          <View style={styles.rowItem}>
            <Pressable
              style={[styles.selectField, !form.city && styles.selectFieldDisabled]}
              onPress={() => form.city && setDistrictPickerOpen(true)}
            >
              <Text style={styles.selectLabel}>İlçe</Text>
              <Text style={form.district ? styles.selectValue : styles.selectPlaceholder}>
                {form.district || (form.city ? 'Seçin' : 'Önce il seçin')}
              </Text>
            </Pressable>
          </View>
        </View>

        <AppTextInput label="Posta Kodu (opsiyonel)" value={form.postalCode} onChangeText={set('postalCode')} keyboardType="numeric" />

        <Pressable style={styles.defaultRow} onPress={() => setForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}>
          <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]} />
          <Text style={styles.defaultLabel}>Varsayılan adres olarak ayarla</Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Vazgeç</Text>
          </Pressable>
          <View style={styles.submitButton}>
            <PrimaryButton title="Kaydet" onPress={handleSubmit} isLoading={isSubmitting} />
          </View>
        </View>
      </ScrollView>

      <PickerModal
        visible={cityPickerOpen}
        title="İl Seçin"
        options={PROVINCES}
        onCancel={() => setCityPickerOpen(false)}
        onSelect={(value) => {
          setForm((prev) => ({ ...prev, city: value, district: '' }));
          setCityPickerOpen(false);
        }}
      />
      <PickerModal
        visible={districtPickerOpen}
        title="İlçe Seçin"
        options={districtOptions}
        onCancel={() => setDistrictPickerOpen(false)}
        onSelect={(value) => {
          setForm((prev) => ({ ...prev, district: value }));
          setDistrictPickerOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  card: { maxHeight: '85%', backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.card, borderTopRightRadius: theme.radius.card },
  scrollContent: { padding: theme.spacing.lg },
  title: { fontSize: 18, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  textarea: { height: 80, textAlignVertical: 'top', paddingTop: 14 },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  rowItem: { flex: 1 },
  selectField: {
    height: 52,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  selectFieldDisabled: { backgroundColor: theme.colors.backgroundAlt },
  selectLabel: { fontSize: 11, color: theme.colors.textMuted, fontFamily: theme.fontFamily.medium },
  selectValue: { fontSize: 16, color: theme.colors.textPrimary, fontFamily: theme.fontFamily.regular },
  selectPlaceholder: { fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: theme.colors.border },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  defaultLabel: { color: theme.colors.textPrimary, fontFamily: theme.fontFamily.regular, fontSize: 14 },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  cancelButton: { flex: 1, height: 48, borderRadius: theme.radius.control, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelText: { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.medium },
  submitButton: { flex: 1 },
});
