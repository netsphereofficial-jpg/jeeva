import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme/spacing';

interface ConnectionBannerProps {
  isConnected: boolean;
  lastSynced: string | null;
  onConnect: () => void;
  platformName: string;
}

export function ConnectionBanner({
  isConnected,
  lastSynced,
  onConnect,
  platformName,
}: ConnectionBannerProps) {
  const { colors } = useAppTheme();
  const tintColor = isConnected ? colors.health : colors.amber;

  const dynamicStyles = useMemo(() => StyleSheet.create({
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.surfaceGlass,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    title: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
      color: colors.textPrimary,
    },
    titleDisconnected: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
      color: colors.amber,
    },
    subtitle: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textSecondary,
    },
  }), [colors]);

  return (
    <Card variant="tinted" tintColor={tintColor} animationIndex={0}>
      <View style={styles.row}>
        <View style={dynamicStyles.iconContainer}>
          {isConnected ? (
            <Wifi size={18} color={colors.health} strokeWidth={2} />
          ) : (
            <WifiOff size={18} color={colors.amber} strokeWidth={2} />
          )}
        </View>

        <View style={styles.textContainer}>
          {isConnected ? (
            <>
              <Text style={dynamicStyles.title}>Connected to {platformName}</Text>
              {lastSynced && (
                <Text style={dynamicStyles.subtitle}>Last synced: {lastSynced}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={dynamicStyles.titleDisconnected}>Not Connected</Text>
              <Text style={dynamicStyles.subtitle}>
                Connect to {platformName} for health data
              </Text>
            </>
          )}
        </View>

        {isConnected ? (
          <View style={[styles.dot, { backgroundColor: colors.health }]} />
        ) : (
          <Button
            variant="secondary"
            label="Connect"
            onPress={onConnect}
            style={styles.connectButton}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  connectButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: spacing.sm,
  },
});
