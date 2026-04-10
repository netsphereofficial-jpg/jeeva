import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Sun,
  Moon,
  Smartphone,
  Droplets,
  Timer,
  Vibrate,
  Scale,
  Check,
  User,
  Trophy,
  ChevronRight,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card } from '@/components/ui/Card';
import { MonoText } from '@/components/ui/MonoText';
import { Toggle } from '@/components/ui/Toggle';
import { spacing, radius } from '@/theme/spacing';
import { useAchievementStore } from '@/stores/achievementStore';
import { ACHIEVEMENTS } from '@/data/achievements';

type ThemeMode = 'dark' | 'light' | 'system' | 'arctic' | 'midnight';

const THEME_OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string; description: string }[] = [
  { mode: 'dark', icon: Moon, label: 'Dark', description: 'Obsidian Forge' },
  { mode: 'light', icon: Sun, label: 'Light', description: 'Warm Stone' },
  { mode: 'arctic', icon: Droplets, label: 'Arctic', description: 'Arctic Blue' },
  { mode: 'midnight', icon: Moon, label: 'Midnight', description: 'Midnight Gold' },
  { mode: 'system', icon: Smartphone, label: 'System', description: 'Follow device' },
];

const REST_OPTIONS = [60, 90, 120, 180] as const;
const WATER_GOALS = [2000, 2500, 3000, 3500, 4000] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, mode, setMode } = useAppTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [nameInput, setNameInput] = useState(settings.userName ?? '');
  const unlockedCount = useAchievementStore((s) => s.unlockedIds.length);
  const totalAchievements = ACHIEVEMENTS.length;

  const handleAchievements = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/achievements');
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setMode(newMode);
  };

  const handleRestTimer = (seconds: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ restTimerDefaultSec: seconds });
  };

  const handleWaterGoal = (ml: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ dailyWaterGoalMl: ml });
  };

  const handleUnitToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    updateSettings({
      unitSystem: settings.unitSystem === 'metric' ? 'imperial' : 'metric',
    });
  };

  const handleHapticToggle = (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ hapticEnabled: value });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PROFILE</Text>
        <Card variant="default" style={styles.sectionCard}>
          <View style={[styles.settingRow, styles.lastOption]}>
            <View style={[styles.themeIconWrap, { backgroundColor: colors.surfaceGlass }]}>
              <User size={18} color={colors.textTertiary} strokeWidth={2} />
            </View>
            <TextInput
              style={[styles.nameInput, { color: colors.textPrimary, borderColor: colors.borderLight, backgroundColor: colors.surfaceGlass }]}
              value={nameInput}
              onChangeText={setNameInput}
              onBlur={() => updateSettings({ userName: nameInput.trim() || undefined })}
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </Card>

        {/* Theme Section */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>APPEARANCE</Text>
        <Card variant="default" style={styles.sectionCard}>
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = mode === option.mode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => handleThemeChange(option.mode)}
                style={[
                  styles.themeOption,
                  { borderBottomColor: colors.border },
                  option.mode === 'system' && styles.lastOption,
                ]}
              >
                <View style={[styles.themeIconWrap, { backgroundColor: isActive ? `${colors.primary}20` : colors.surfaceGlass }]}>
                  <Icon size={18} color={isActive ? colors.primary : colors.textTertiary} strokeWidth={2} />
                </View>
                <View style={styles.themeTextWrap}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>{option.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>{option.description}</Text>
                </View>
                {isActive && (
                  <Check size={20} color={colors.primary} strokeWidth={2.5} />
                )}
              </Pressable>
            );
          })}
        </Card>

        {/* Units */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>UNITS</Text>
        <Card variant="default" style={styles.sectionCard}>
          <Pressable onPress={handleUnitToggle} style={[styles.settingRow, styles.lastOption]}>
            <View style={[styles.themeIconWrap, { backgroundColor: colors.surfaceGlass }]}>
              <Scale size={18} color={colors.textTertiary} strokeWidth={2} />
            </View>
            <View style={styles.themeTextWrap}>
              <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Weight Unit</Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                {settings.unitSystem === 'metric' ? 'Kilograms (kg)' : 'Pounds (lbs)'}
              </Text>
            </View>
            <MonoText size={14} color={colors.primary}>
              {settings.unitSystem === 'metric' ? 'kg' : 'lbs'}
            </MonoText>
          </Pressable>
        </Card>

        {/* Rest Timer Default */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>REST TIMER</Text>
        <Card variant="default" style={styles.sectionCard}>
          <View style={[styles.pillRow, styles.lastOption]}>
            <Timer size={18} color={colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.pillLabel, { color: colors.textPrimary }]}>Default Duration</Text>
            <View style={styles.pills}>
              {REST_OPTIONS.map((sec) => {
                const isActive = settings.restTimerDefaultSec === sec;
                return (
                  <Pressable
                    key={sec}
                    onPress={() => handleRestTimer(sec)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isActive ? `${colors.primary}20` : colors.surfaceGlass,
                        borderColor: isActive ? colors.primary : colors.surfaceGlassBorder,
                      },
                    ]}
                  >
                    <MonoText size={12} color={isActive ? colors.primary : colors.textSecondary}>
                      {sec}s
                    </MonoText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Water Goal */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>HYDRATION</Text>
        <Card variant="default" style={styles.sectionCard}>
          <View style={[styles.pillRow, styles.lastOption]}>
            <Droplets size={18} color={colors.water} strokeWidth={2} />
            <Text style={[styles.pillLabel, { color: colors.textPrimary }]}>Daily Goal</Text>
            <View style={styles.pills}>
              {WATER_GOALS.map((ml) => {
                const isActive = settings.dailyWaterGoalMl === ml;
                return (
                  <Pressable
                    key={ml}
                    onPress={() => handleWaterGoal(ml)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isActive ? `${colors.water}20` : colors.surfaceGlass,
                        borderColor: isActive ? colors.water : colors.surfaceGlassBorder,
                      },
                    ]}
                  >
                    <MonoText size={11} color={isActive ? colors.water : colors.textSecondary}>
                      {ml / 1000}L
                    </MonoText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Haptics */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FEEDBACK</Text>
        <Card variant="default" style={styles.sectionCard}>
          <View style={[styles.settingRow, styles.lastOption]}>
            <View style={[styles.themeIconWrap, { backgroundColor: colors.surfaceGlass }]}>
              <Vibrate size={18} color={colors.textTertiary} strokeWidth={2} />
            </View>
            <View style={styles.themeTextWrap}>
              <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Haptic Feedback</Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>Vibrations on interactions</Text>
            </View>
            <Toggle value={settings.hapticEnabled} onToggle={handleHapticToggle} />
          </View>
        </Card>

        {/* Achievements */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ACHIEVEMENTS</Text>
        <Card variant="default" style={styles.sectionCard}>
          <Pressable onPress={handleAchievements} style={[styles.settingRow, styles.lastOption]}>
            <View style={[styles.themeIconWrap, { backgroundColor: `${colors.pr}20` }]}>
              <Trophy size={18} color={colors.pr} strokeWidth={2} />
            </View>
            <View style={styles.themeTextWrap}>
              <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Achievements & Badges</Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                {unlockedCount}/{totalAchievements} unlocked
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
          </Pressable>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.textTertiary }]}>JEEVA</Text>
          <MonoText size={12} color={colors.textTertiary}>v1.0.0</MonoText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  headerSpacer: { width: 48 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: spacing['2xl'],
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  themeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
  },
  optionDesc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  pillRow: {
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  pillLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    gap: spacing.xs,
  },
  appName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    letterSpacing: 3,
  },
  nameInput: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    minHeight: 44,
  },
});
