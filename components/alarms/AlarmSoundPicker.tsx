import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Volume2, Check, Play, Square } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/theme/spacing';
import { ALARM_SOUNDS, type AlarmSoundOption } from '@/data/alarmSounds';
import { previewAlarmSound, stopPreview } from '@/services/alarmSound';

interface AlarmSoundPickerProps {
  selectedSoundId: string;
  onSelect: (soundId: string) => void;
}

export function AlarmSoundPicker({ selectedSoundId, onSelect }: AlarmSoundPickerProps) {
  const { colors, isDark } = useAppTheme();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePreview = useCallback(async (soundId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (playingId === soundId) {
      // Stop previewing
      await stopPreview();
      setPlayingId(null);
    } else {
      // Start previewing
      setPlayingId(soundId);
      await previewAlarmSound(soundId);
      // Auto-clear playing state after preview ends
      setTimeout(() => setPlayingId(null), 4200);
    }
  }, [playingId]);

  const handleSelect = useCallback((soundId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSelect(soundId);
    // Preview the selected sound
    handlePreview(soundId);
  }, [onSelect, handlePreview]);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    soundRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceGlass,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    soundRowSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? 'rgba(255,107,53,0.08)' : 'rgba(255,107,53,0.06)',
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    },
    textContainer: {
      flex: 1,
    },
    soundName: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
      color: colors.textPrimary,
    },
    soundDesc: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 1,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    playButtonActive: {
      backgroundColor: isDark ? 'rgba(255,107,53,0.15)' : 'rgba(255,107,53,0.1)',
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
  }), [colors, isDark]);

  return (
    <View style={dynamicStyles.container}>
      {ALARM_SOUNDS.map((sound, index) => {
        const isSelected = sound.id === selectedSoundId;
        const isPlaying = sound.id === playingId;

        return (
          <Animated.View
            key={sound.id}
            entering={FadeInDown.delay(index * 40).duration(300)}
          >
            <Pressable
              onPress={() => handleSelect(sound.id)}
              style={[
                dynamicStyles.soundRow,
                isSelected && dynamicStyles.soundRowSelected,
              ]}
            >
              {/* Icon */}
              <View style={dynamicStyles.iconCircle}>
                <Text style={{ fontSize: 20 }}>{sound.icon}</Text>
              </View>

              {/* Text */}
              <View style={dynamicStyles.textContainer}>
                <Text style={dynamicStyles.soundName}>{sound.name}</Text>
                <Text style={dynamicStyles.soundDesc}>{sound.description}</Text>
              </View>

              {/* Preview button */}
              <Pressable
                onPress={() => handlePreview(sound.id)}
                hitSlop={8}
                style={[
                  dynamicStyles.playButton,
                  isPlaying && dynamicStyles.playButtonActive,
                ]}
              >
                {isPlaying ? (
                  <Square size={14} color={colors.primary} fill={colors.primary} strokeWidth={0} />
                ) : (
                  <Play size={14} color={colors.textSecondary} fill={colors.textSecondary} strokeWidth={0} />
                )}
              </Pressable>

              {/* Selected check */}
              {isSelected && (
                <View style={dynamicStyles.checkIcon}>
                  <Check size={14} color={isDark ? '#0A0A0F' : '#FFFFFF'} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
