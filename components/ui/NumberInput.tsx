import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MonoText } from './MonoText';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  compact?: boolean;
}

export function NumberInput({
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  compact = false,
}: NumberInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(String(value));

  const clamp = useCallback(
    (v: number): number => {
      let clamped = v;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      return clamped;
    },
    [min, max],
  );

  const handleDecrement = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newValue = clamp(value - step);
    onChange(newValue);
    setTextValue(String(newValue));
  };

  const handleIncrement = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newValue = clamp(value + step);
    onChange(newValue);
    setTextValue(String(newValue));
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setTextValue(String(value));
  };

  const handleEndEditing = () => {
    setIsEditing(false);
    const parsed = parseFloat(textValue);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      onChange(clamped);
      setTextValue(String(clamped));
    } else {
      setTextValue(String(value));
    }
  };

  if (compact) {
    return (
      <Pressable style={styles.compactContainer} onPress={handleStartEditing}>
        {isEditing ? (
          <TextInput
            style={styles.compactInput}
            value={textValue}
            onChangeText={setTextValue}
            onBlur={handleEndEditing}
            onSubmitEditing={handleEndEditing}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <View style={styles.compactDisplayRow}>
            <MonoText size={16} color={colors.textPrimary}>
              {value}
            </MonoText>
            {unit && (
              <MonoText size={10} color={colors.textTertiary}>
                {unit}
              </MonoText>
            )}
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleDecrement}
        style={styles.button}
        hitSlop={8}
      >
        <MonoText size={20} color={colors.textSecondary}>
          -
        </MonoText>
      </Pressable>

      <Pressable style={styles.valueContainer} onPress={handleStartEditing}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={textValue}
            onChangeText={setTextValue}
            onBlur={handleEndEditing}
            onSubmitEditing={handleEndEditing}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <View style={styles.displayRow}>
            <MonoText size={18} color={colors.textPrimary}>
              {value}
            </MonoText>
            {unit && (
              <MonoText size={12} color={colors.textTertiary} style={styles.unit}>
                {unit}
              </MonoText>
            )}
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={handleIncrement}
        style={styles.button}
        hitSlop={8}
      >
        <MonoText size={20} color={colors.textSecondary}>
          +
        </MonoText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  button: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  input: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    minWidth: 60,
    padding: 0,
  },
  unit: {
    marginLeft: 4,
  },
  compactContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  compactInput: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    minWidth: 40,
    padding: 0,
  },
});
