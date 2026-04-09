import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
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
  const tintColor = isConnected ? colors.health : '#F59E0B';

  return (
    <Card variant="tinted" tintColor={tintColor} animationIndex={0}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          {isConnected ? (
            <Wifi size={18} color={colors.health} strokeWidth={2} />
          ) : (
            <WifiOff size={18} color="#F59E0B" strokeWidth={2} />
          )}
        </View>

        <View style={styles.textContainer}>
          {isConnected ? (
            <>
              <Text style={styles.title}>Connected to {platformName}</Text>
              {lastSynced && (
                <Text style={styles.subtitle}>Last synced: {lastSynced}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.titleDisconnected}>Not Connected</Text>
              <Text style={styles.subtitle}>
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
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  titleDisconnected: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#F59E0B',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
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
