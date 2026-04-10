import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, Play, Square, Upload, Trash2, Music } from 'lucide-react-native';
import { MonoText } from '@/components/ui/MonoText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/theme/spacing';
import {
  BUILTIN_SOUNDS,
  createCustomSound,
  type AlarmSoundOption,
} from '@/data/alarmSounds';
import { useCustomSoundsStore } from '@/stores/customSoundsStore';
import { previewAlarmSound, stopPreview } from '@/services/alarmSound';

interface AlarmSoundPickerProps {
  selectedSoundId: string;
  onSelect: (soundId: string) => void;
}

export function AlarmSoundPicker({ selectedSoundId, onSelect }: AlarmSoundPickerProps) {
  const { colors, isDark } = useAppTheme();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const customSounds = useCustomSoundsStore((s) => s.sounds);
  const addCustomSound = useCustomSoundsStore((s) => s.addSound);
  const removeCustomSound = useCustomSoundsStore((s) => s.removeSound);

  // Combine builtin + custom sounds
  const allSounds = useMemo(
    () => [...BUILTIN_SOUNDS, ...customSounds],
    [customSounds],
  );

  const handlePreview = useCallback(async (sound: AlarmSoundOption) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (playingId === sound.id) {
      await stopPreview();
      setPlayingId(null);
    } else {
      setPlayingId(sound.id);
      await previewAlarmSound(sound.id);
      setTimeout(() => setPlayingId(null), 4200);
    }
  }, [playingId]);

  const handleSelect = useCallback((soundId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onSelect(soundId);
  }, [onSelect]);

  const handleUpload = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const fileName = asset.name || 'Custom Sound';
      const displayName = fileName.replace(/\.(mp3|wav|m4a|aac|ogg)$/i, '');

      // Use the cache URI directly (DocumentPicker copies it to cache)
      const customSound = createCustomSound(displayName, asset.uri);
      addCustomSound(customSound);
      onSelect(customSound.id);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.warn('[AlarmSoundPicker] Upload failed:', err);
      Alert.alert('Upload Failed', 'Could not import the audio file. Please try a different file.');
    }
  }, [addCustomSound, onSelect]);

  const handleDeleteCustom = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Remove Custom Sound',
      'Are you sure you want to remove this sound?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // If this was selected, switch back to default
            if (selectedSoundId === id) {
              onSelect('gentle');
            }
            removeCustomSound(id);
          },
        },
      ],
    );
  }, [selectedSoundId, onSelect, removeCustomSound]);

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    sectionLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 11,
      color: colors.textTertiary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    soundRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
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
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    },
    textContainer: {
      flex: 1,
    },
    soundName: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
      color: colors.textPrimary,
    },
    soundDesc: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 1,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    actionBtnActive: {
      backgroundColor: isDark ? 'rgba(255,107,53,0.15)' : 'rgba(255,107,53,0.1)',
    },
    checkIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    uploadRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderLight,
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    uploadText: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
      color: colors.primary,
    },
    uploadSubtext: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 11,
      color: colors.textTertiary,
    },
  }), [colors, isDark]);

  const renderSoundRow = (sound: AlarmSoundOption, index: number) => {
    const isSelected = sound.id === selectedSoundId;
    const isPlaying = sound.id === playingId;

    return (
      <Animated.View
        key={sound.id}
        entering={FadeInDown.delay(index * 30).duration(250)}
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
            <Text style={{ fontSize: 18 }}>{sound.icon}</Text>
          </View>

          {/* Text */}
          <View style={dynamicStyles.textContainer}>
            <Text style={dynamicStyles.soundName}>{sound.name}</Text>
            <Text style={dynamicStyles.soundDesc}>{sound.description}</Text>
          </View>

          {/* Preview button */}
          <Pressable
            onPress={() => handlePreview(sound)}
            hitSlop={8}
            style={[
              dynamicStyles.actionBtn,
              isPlaying && dynamicStyles.actionBtnActive,
            ]}
          >
            {isPlaying ? (
              <Square size={12} color={colors.primary} fill={colors.primary} strokeWidth={0} />
            ) : (
              <Play size={12} color={colors.textSecondary} fill={colors.textSecondary} strokeWidth={0} />
            )}
          </Pressable>

          {/* Delete button for custom sounds */}
          {sound.isCustom && (
            <Pressable
              onPress={() => handleDeleteCustom(sound.id)}
              hitSlop={8}
              style={dynamicStyles.actionBtn}
            >
              <Trash2 size={14} color={colors.heart} strokeWidth={1.5} />
            </Pressable>
          )}

          {/* Selected check */}
          {isSelected && (
            <View style={dynamicStyles.checkIcon}>
              <Check size={12} color={isDark ? '#0A0A0F' : '#FFFFFF'} strokeWidth={3} />
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Built-in sounds */}
      {BUILTIN_SOUNDS.map((sound, index) => renderSoundRow(sound, index))}

      {/* Custom sounds section */}
      {customSounds.length > 0 && (
        <>
          <Text style={dynamicStyles.sectionLabel}>Your Sounds</Text>
          {customSounds.map((sound, index) =>
            renderSoundRow(sound, BUILTIN_SOUNDS.length + index),
          )}
        </>
      )}

      {/* Upload button */}
      <Pressable onPress={handleUpload} style={dynamicStyles.uploadRow}>
        <View style={[dynamicStyles.iconCircle, { backgroundColor: isDark ? 'rgba(255,107,53,0.1)' : 'rgba(255,107,53,0.08)' }]}>
          <Upload size={18} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={dynamicStyles.textContainer}>
          <Text style={dynamicStyles.uploadText}>Upload Custom Sound</Text>
          <Text style={dynamicStyles.uploadSubtext}>MP3, WAV, M4A, AAC</Text>
        </View>
        <Music size={18} color={colors.textTertiary} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}
