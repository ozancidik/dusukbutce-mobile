import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';
import { PickerModal } from '../../profile/components/PickerModal';
import { TURKEY_PROVINCES } from '../../profile/data/turkeyProvinces';
import { PillSelectField } from '../components/PillSelectField';
import { APPOINTMENT_TIME_SLOTS, SHIPPING_METHOD_OPTIONS } from '../data/technicalServiceOptions';
import { DeliveryMethod, technicalServiceRepository } from '../api/technicalServiceRepository';
import { ApiException } from '../../../core/network/apiException';
import { estimatesRepository, type EstimateAnswer } from '../../ai/api/estimatesRepository';

interface Props {
  serviceType: string;
  deliveryMethod: DeliveryMethod;
}

const PROVINCES = Object.keys(TURKEY_PROVINCES);
const TIME_SLOT_OPTIONS = APPOINTMENT_TIME_SLOTS.map((slot) => ({ value: slot, label: slot }));

export function TechnicalServiceFormScreen({ serviceType, deliveryMethod }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [districtPickerOpen, setDistrictPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ submissionId: string } | null>(null);
  const [repairEstimate, setRepairEstimate] = useState<EstimateAnswer | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);

  const districtOptions = city ? TURKEY_PROVINCES[city] ?? [] : [];
  const isEvimdenAl = deliveryMethod === 'evimden-al';

  const handleRepairEstimate = async () => {
    if (!deviceInfo.trim() || !problemDescription.trim()) {
      Alert.alert('Bilgi eksik', 'Cihaz bilgisi ve sorun açıklaması gereklidir.');
      return;
    }
    setIsLoadingEstimate(true);
    try {
      const result = await estimatesRepository.repairEstimate(deviceInfo, problemDescription);
      setRepairEstimate(result);
    } catch (error) {
      setRepairEstimate({
        answer: 'Tamir maliyeti tahmini şu anda kullanılabilir değil.',
        sources: [],
        status: 'error',
      });
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  const onSubmit = async () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !district.trim() ||
      !deviceInfo.trim() ||
      !problemDescription.trim()
    ) {
      Alert.alert('Eksik bilgi', 'Ad soyad, telefon, il/ilçe, adres, cihaz bilgisi ve sorun açıklaması zorunludur.');
      return;
    }
    if (isEvimdenAl && (!preferredDate.trim() || !preferredTime)) {
      Alert.alert('Eksik bilgi', 'Randevu tarihi ve saati zorunludur.');
      return;
    }
    if (!isEvimdenAl && !shippingMethod) {
      Alert.alert('Eksik bilgi', 'Kargo firması seçimi zorunludur.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await technicalServiceRepository.submit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city,
        district,
        serviceType,
        deliveryMethod,
        deviceInfo: deviceInfo.trim(),
        problemDescription: problemDescription.trim(),
        notes: notes.trim() || undefined,
        ...(isEvimdenAl
          ? { preferredDate: preferredDate.trim(), preferredTime }
          : { shippingMethod }),
      });
      setResult(res);
    } catch (e) {
      Alert.alert('Hata', e instanceof ApiException ? e.message : 'Talep gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Talebiniz alındı</Text>
        <Text style={styles.successBody}>
          Ekibimiz en kısa sürede sizinle iletişime geçecek.
        </Text>
        <Text style={styles.successRef}>Referans No: {result.submissionId}</Text>
        <PrimaryButton title="Anasayfaya dön" onPress={() => router.replace('/(app)')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'} Geri</Text>
      </Pressable>

      <Text style={styles.title}>{serviceType}</Text>
      <Text style={styles.subtitle}>
        {isEvimdenAl ? '🏠 Evimden Al' : '📦 Kargo ile Gönder'} — Talebinizi eksiksiz doldurun
      </Text>

      <AppTextInput label="Ad Soyad" value={name} onChangeText={setName} />
      <AppTextInput label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppTextInput label="E-posta (opsiyonel)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Pressable style={styles.selectField} onPress={() => setCityPickerOpen(true)}>
            <Text style={styles.selectLabel}>İl</Text>
            <Text style={city ? styles.selectValue : styles.selectPlaceholder}>{city || 'Seçin'}</Text>
          </Pressable>
        </View>
        <View style={styles.rowItem}>
          <Pressable
            style={[styles.selectField, !city && styles.selectFieldDisabled]}
            onPress={() => city && setDistrictPickerOpen(true)}
          >
            <Text style={styles.selectLabel}>İlçe</Text>
            <Text style={district ? styles.selectValue : styles.selectPlaceholder}>
              {district || (city ? 'Seçin' : 'Önce il seçin')}
            </Text>
          </Pressable>
        </View>
      </View>

      <AppTextInput label="Adres" value={address} onChangeText={setAddress} multiline style={styles.textarea} />

      <AppTextInput label="Cihaz Bilgisi (Marka/Model)" value={deviceInfo} onChangeText={setDeviceInfo} />
      <AppTextInput
        label="Sorun Açıklaması"
        value={problemDescription}
        onChangeText={setProblemDescription}
        multiline
        style={styles.textarea}
      />

      {deviceInfo && problemDescription && (
        <Pressable
          onPress={handleRepairEstimate}
          disabled={isLoadingEstimate}
          style={[styles.estimateButton, isLoadingEstimate && styles.estimateButtonDisabled]}
        >
          {isLoadingEstimate ? (
            <ActivityIndicator color={theme.colors.white} size="small" />
          ) : (
            <Text style={styles.estimateButtonText}>🔧 Tamir Maliyeti Tahminle</Text>
          )}
        </Pressable>
      )}

      {repairEstimate && (
        <View style={[styles.estimateCard, repairEstimate.status === 'error' && styles.estimateCardError]}>
          <Text style={styles.estimateTitle}>Tamir Maliyeti Tahmini</Text>
          <Text style={styles.estimateAnswer}>{repairEstimate.answer}</Text>
          {repairEstimate.sources && repairEstimate.sources.length > 0 && (
            <View style={styles.sourcesList}>
              <Text style={styles.sourcesLabel}>Referanslar:</Text>
              {repairEstimate.sources.map((source, idx) => (
                source.url && (
                  <Text key={idx} style={styles.sourceUrl}>
                    {source.title || source.url}
                  </Text>
                )
              ))}
            </View>
          )}
        </View>
      )}

      <AppTextInput label="Notlar (opsiyonel)" value={notes} onChangeText={setNotes} multiline style={styles.textareaSmall} />

      {isEvimdenAl ? (
        <>
          <AppTextInput label="Randevu Tarihi (GG.AA.YYYY)" value={preferredDate} onChangeText={setPreferredDate} keyboardType="numbers-and-punctuation" />
          <PillSelectField label="Randevu Saati" options={TIME_SLOT_OPTIONS} value={preferredTime} onChange={setPreferredTime} />
        </>
      ) : (
        <PillSelectField label="Kargo Firması" options={SHIPPING_METHOD_OPTIONS} value={shippingMethod} onChange={setShippingMethod} />
      )}

      <PrimaryButton title="Talebi Gönder" onPress={onSubmit} isLoading={isSubmitting} />

      <PickerModal
        visible={cityPickerOpen}
        title="İl Seçin"
        options={PROVINCES}
        onCancel={() => setCityPickerOpen(false)}
        onSelect={(value) => {
          setCity(value);
          setDistrict('');
          setCityPickerOpen(false);
        }}
      />
      <PickerModal
        visible={districtPickerOpen}
        title="İlçe Seçin"
        options={districtOptions}
        onCancel={() => setDistrictPickerOpen(false)}
        onSelect={(value) => {
          setDistrict(value);
          setDistrictPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 60, paddingBottom: theme.spacing.xl },
  backButton: { marginBottom: theme.spacing.md },
  backText: { color: theme.colors.primary, fontFamily: theme.fontFamily.medium, fontSize: 15 },
  title: { fontSize: 22, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4, marginBottom: theme.spacing.lg, fontFamily: theme.fontFamily.regular },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 14 },
  textareaSmall: { height: 72, textAlignVertical: 'top', paddingTop: 14 },
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
  successContainer: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.sm },
  successIcon: { fontSize: 48 },
  successTitle: { fontSize: 22, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary },
  successBody: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', fontFamily: theme.fontFamily.regular },
  successRef: { fontSize: 12, color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular, marginBottom: theme.spacing.lg },
  estimateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.control,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  estimateButtonDisabled: { opacity: 0.6 },
  estimateButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontFamily: theme.fontFamily.semiBold,
  },
  estimateCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  estimateCardError: { backgroundColor: theme.colors.background },
  estimateTitle: {
    fontSize: 14,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  estimateAnswer: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    fontFamily: theme.fontFamily.regular,
    marginBottom: theme.spacing.sm,
  },
  sourcesList: { marginTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm },
  sourcesLabel: { fontSize: 11, fontFamily: theme.fontFamily.medium, color: theme.colors.textMuted, marginBottom: 4 },
  sourceUrl: { fontSize: 11, color: theme.colors.primary, fontFamily: theme.fontFamily.regular, marginVertical: 2 },
});
