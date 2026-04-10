import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Quote } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';
import { getTodaysQuote } from '@/data/quotes';

interface QuoteCardProps {
  animationIndex?: number;
}

export function QuoteCard({ animationIndex = 0 }: QuoteCardProps) {
  const { colors, isDark } = useAppTheme();
  const quote = useMemo(() => getTodaysQuote(), []);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        quoteText: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 15,
          color: colors.textPrimary,
          lineHeight: 22,
          fontStyle: 'italic',
        },
        authorText: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 13,
          color: colors.textTertiary,
          marginTop: spacing.sm,
        },
        iconBg: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: isDark
            ? 'rgba(255,107,53,0.1)'
            : 'rgba(255,107,53,0.08)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.md,
        },
      }),
    [colors, isDark],
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(animationIndex * 60).duration(400)}
      style={styles.container}
    >
      <Card variant="default">
        <View style={dynamicStyles.iconBg}>
          <Quote size={16} color={colors.primary} strokeWidth={2} />
        </View>
        <Text style={dynamicStyles.quoteText}>"{quote.text}"</Text>
        <Text style={dynamicStyles.authorText}>— {quote.author}</Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
});
