import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';

export const EmptyState = memo(function EmptyState() {
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 }}>
      <View
        style={{
          width: 80, height: 80, borderRadius: 40,
          alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          backgroundColor: colors.surfaceSoft,
        }}
      >
        <ClipboardList size={40} color="#64748B" />
      </View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
        {t('noHabits')}
      </Text>
      <Text style={{ fontSize: 16, color: colors.secondaryText, textAlign: 'center', lineHeight: 24 }}>
        {t('noHabitsDesc')}
      </Text>
    </View>
  );
});
