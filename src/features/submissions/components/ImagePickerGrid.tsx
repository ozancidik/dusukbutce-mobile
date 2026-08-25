import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { theme } from '../../../core/theme/theme';
import { submissionsRepository } from '../api/submissionsRepository';
import { ApiException } from '../../../core/network/apiException';

interface Props {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImagePickerGrid({ imageUrls, onChange, maxImages = 8 }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf eklemek için galeri erişimine izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(0, maxImages - imageUrls.length),
    });
    if (result.canceled || result.assets.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const asset of result.assets) {
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1600 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        if (!manipulated.base64) continue;
        const dataUrl = `data:image/jpeg;base64,${manipulated.base64}`;
        const url = await submissionsRepository.uploadImage(dataUrl);
        uploadedUrls.push(url);
      }
      onChange([...imageUrls, ...uploadedUrls]);
    } catch (e) {
      Alert.alert('Hata', e instanceof ApiException ? e.message : 'Görsel yüklenemedi');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <View>
      <Text style={styles.label}>Fotoğraflar ({imageUrls.length}/{maxImages})</Text>
      <View style={styles.grid}>
        {imageUrls.map((url, index) => (
          <View key={url + index} style={styles.thumbWrapper}>
            <Image source={{ uri: url }} style={styles.thumb} resizeMode="cover" />
            <Pressable style={styles.removeBadge} onPress={() => removeImage(index)}>
              <Text style={styles.removeBadgeText}>×</Text>
            </Pressable>
          </View>
        ))}
        {imageUrls.length < maxImages ? (
          <Pressable style={styles.addTile} onPress={pickAndUpload} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={styles.addTileText}>+</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const TILE_SIZE = 84;

const styles = StyleSheet.create({
  label: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: theme.fontFamily.medium },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  thumbWrapper: { width: TILE_SIZE, height: TILE_SIZE },
  thumb: { width: '100%', height: '100%', borderRadius: theme.radius.control },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgeText: { color: theme.colors.white, fontSize: 14, lineHeight: 16, fontFamily: theme.fontFamily.bold },
  addTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  addTileText: { fontSize: 28, color: theme.colors.primary, fontFamily: theme.fontFamily.regular },
});
