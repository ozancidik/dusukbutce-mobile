import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/theme';
import { Submission } from '../../../shared/models/Submission';
import { STATUS_COLORS, STATUS_LABELS } from '../statusConfig';
import { getCategoryLabel } from '../../listings/categories';

interface Props {
  submission: Submission;
  onAccept: () => void;
  onReject: () => void;
  onReoffer: () => void;
  onCancel: () => void;
}

export function OfferCard({ submission, onAccept, onReject, onReoffer, onCancel }: Props) {
  const statusColor = STATUS_COLORS[submission.status];
  const statusLabel = STATUS_LABELS[submission.status];
  const title = `${submission.brand ?? ''} ${submission.model ?? ''}`.trim() || 'Ürün';

  const canRespond = submission.status === 'offered';
  const canReoffer = submission.status === 'rejected';
  const canCancel = submission.status === 'pending' || submission.status === 'offered';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>
            {getCategoryLabel(submission.category)} · {submission.submissionNumber}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}1A`, borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {typeof submission.offer?.amount === 'number' ? (
        <Text style={styles.offerAmount}>{submission.offer.amount.toLocaleString('tr-TR')} TL</Text>
      ) : null}

      {(canRespond || canReoffer || canCancel) && (
        <View style={styles.actions}>
          {canRespond ? (
            <>
              <Pressable style={[styles.actionButton, styles.acceptButton]} onPress={onAccept}>
                <Text style={styles.acceptText}>Kabul Et</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
                <Text style={styles.rejectText}>Reddet</Text>
              </Pressable>
            </>
          ) : null}
          {canReoffer ? (
            <Pressable style={[styles.actionButton, styles.reofferButton]} onPress={onReoffer}>
              <Text style={styles.reofferText}>Yeniden Teklif İste</Text>
            </Pressable>
          ) : null}
          {canCancel ? (
            <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>İptal Et</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1, marginRight: theme.spacing.sm },
  title: { fontSize: 16, fontFamily: theme.fontFamily.semiBold, color: theme.colors.textPrimary },
  meta: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2, fontFamily: theme.fontFamily.regular },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 11, fontFamily: theme.fontFamily.semiBold },
  offerAmount: { fontSize: 20, fontFamily: theme.fontFamily.bold, color: theme.colors.danger, marginTop: theme.spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  actionButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  acceptButton: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  acceptText: { color: theme.colors.white, fontFamily: theme.fontFamily.semiBold, fontSize: 13 },
  rejectButton: { backgroundColor: theme.colors.white, borderColor: theme.colors.danger },
  rejectText: { color: theme.colors.danger, fontFamily: theme.fontFamily.semiBold, fontSize: 13 },
  reofferButton: { backgroundColor: theme.colors.white, borderColor: theme.colors.primary },
  reofferText: { color: theme.colors.primary, fontFamily: theme.fontFamily.semiBold, fontSize: 13 },
  cancelButton: { backgroundColor: theme.colors.white, borderColor: theme.colors.border },
  cancelText: { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.semiBold, fontSize: 13 },
});
