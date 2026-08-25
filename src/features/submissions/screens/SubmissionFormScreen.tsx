import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../core/theme/theme';
import { AppTextInput } from '../../../shared/widgets/AppTextInput';
import { PrimaryButton } from '../../../shared/widgets/PrimaryButton';
import { DynamicField } from '../components/DynamicField';
import { ImagePickerGrid } from '../components/ImagePickerGrid';
import { CategoryFormConfig, COSMETIC_CONDITION_OPTIONS } from '../config/categoryFormConfigs';
import { submissionsRepository } from '../api/submissionsRepository';
import { ApiException } from '../../../core/network/apiException';

interface Props {
  config: CategoryFormConfig;
}

export function SubmissionFormScreen({ config }: Props) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [cosmeticCondition, setCosmeticCondition] = useState('');
  const [description, setDescription] = useState('');
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyDuration, setWarrantyDuration] = useState('');
  const [hasBox, setHasBox] = useState(false);
  const [hasInvoice, setHasInvoice] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [extraValues, setExtraValues] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ submissionNumber: string } | null>(null);

  const onSubmit = async () => {
    if (!brand.trim() || !model.trim() || !cosmeticCondition) {
      Alert.alert('Eksik bilgi', 'Marka, model ve kozmetik durum alanları zorunludur.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submissionsRepository.submit(config, {
        brand: brand.trim(),
        model: model.trim(),
        cosmeticCondition,
        description: description.trim(),
        hasWarranty,
        warrantyDuration: hasWarranty ? warrantyDuration : undefined,
        hasBox,
        hasInvoice,
        invoiceDate: hasInvoice ? invoiceDate : undefined,
        images,
        quantity: 1,
        ...extraValues,
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
        <Text style={styles.successSubtitle}>Talep numaranız: {result.submissionNumber}</Text>
        <Text style={styles.successBody}>
          Ekibimiz ürününüzü inceleyip en kısa sürede size bir teklif sunacak.
        </Text>
        <PrimaryButton title="Anasayfaya dön" onPress={() => router.replace('/(app)')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'} Geri</Text>
      </Pressable>

      <Text style={styles.title}>
        {config.icon} {config.name}
      </Text>
      <Text style={styles.subtitle}>Ürün bilgilerini eksiksiz doldurun</Text>

      <AppTextInput label="Marka" value={brand} onChangeText={setBrand} />
      <AppTextInput label="Model" value={model} onChangeText={setModel} />

      <DynamicField
        field={{ key: 'cosmeticCondition', label: 'Kozmetik Durum', type: 'select', options: COSMETIC_CONDITION_OPTIONS }}
        value={cosmeticCondition}
        onChange={(v) => setCosmeticCondition(v as string)}
      />

      {config.extraFields.map((field) => (
        <DynamicField
          key={field.key}
          field={field}
          value={extraValues[field.key]}
          onChange={(v) => setExtraValues((prev) => ({ ...prev, [field.key]: v }))}
        />
      ))}

      <DynamicField field={{ key: 'hasWarranty', label: 'Garanti Var mı', type: 'boolean' }} value={hasWarranty} onChange={(v) => setHasWarranty(v as boolean)} />
      {hasWarranty ? (
        <AppTextInput label="Garanti Süresi" value={warrantyDuration} onChangeText={setWarrantyDuration} />
      ) : null}

      <DynamicField field={{ key: 'hasBox', label: 'Kutusu Var mı', type: 'boolean' }} value={hasBox} onChange={(v) => setHasBox(v as boolean)} />

      <DynamicField field={{ key: 'hasInvoice', label: 'Faturası Var mı', type: 'boolean' }} value={hasInvoice} onChange={(v) => setHasInvoice(v as boolean)} />
      {hasInvoice ? (
        <AppTextInput label="Fatura Tarihi" value={invoiceDate} onChangeText={setInvoiceDate} />
      ) : null}

      <AppTextInput label="Açıklama (opsiyonel)" value={description} onChangeText={setDescription} multiline style={styles.textarea} />

      <View style={styles.imageSection}>
        <ImagePickerGrid imageUrls={images} onChange={setImages} />
      </View>

      <PrimaryButton title="Talebi Gönder" onPress={onSubmit} isLoading={isSubmitting} />
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
  imageSection: { marginBottom: theme.spacing.lg },
  successContainer: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.sm },
  successIcon: { fontSize: 48 },
  successTitle: { fontSize: 22, fontFamily: theme.fontFamily.bold, color: theme.colors.textPrimary },
  successSubtitle: { fontSize: 16, fontFamily: theme.fontFamily.semiBold, color: theme.colors.primary },
  successBody: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', fontFamily: theme.fontFamily.regular, marginBottom: theme.spacing.lg },
});
