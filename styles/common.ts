import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from './theme';

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  screenPadding: {
    padding: spacing.lg,
  },
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSpacing: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.xs,
    color: colors.text,
    backgroundColor: colors.background,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.xs,
    marginBottom: spacing.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItem: {
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: typography.subtitle,
    color: colors.text,
  },
  bodyText: {
    fontSize: typography.body,
    color: colors.text,
  },
  mutedText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  subtleText: {
    fontSize: typography.caption,
    color: colors.textSubtle,
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
