import { CategoryFormConfig } from './config/categoryFormConfigs';

interface CommonValues {
  brand: string;
  model: string;
  cosmeticCondition: string;
  extraValues: Record<string, unknown>;
}

// Kategori kendi markasını (fixedBrand) veya kendi `model` alanını getiriyorsa
// ortak Marka/Model kutuları gösterilmez, dolayısıyla zorunlu da sayılmaz.
export function hasOwnModelField(config: CategoryFormConfig): boolean {
  return config.extraFields.some((f) => f.key === 'model');
}

export function getMissingFields(config: CategoryFormConfig, values: CommonValues): string[] {
  const missing: string[] = [];
  if (!config.fixedBrand && !values.brand.trim()) missing.push('Marka');
  if (!hasOwnModelField(config) && !values.model.trim()) missing.push('Model');
  if (!values.cosmeticCondition) missing.push('Kozmetik Durum');
  for (const field of config.extraFields) {
    if (!field.required || field.type === 'boolean') continue;
    const value = values.extraValues[field.key];
    if (typeof value !== 'string' || !value.trim()) missing.push(field.label);
  }
  return missing;
}
