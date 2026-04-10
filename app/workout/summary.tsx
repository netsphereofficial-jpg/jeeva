import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Hash,
  Trophy,
  Share2,
  Download,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { MonoText } from '@/components/ui/MonoText';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ShareCard } from '@/components/workout/ShareCard';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { InsightCard } from '@/components/workout/InsightCard';
import { generateWorkoutInsights } from '@/utils/workoutInsights';
import { opacity } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { TemplateExercise } from '@/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function WorkoutSummaryScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const history = useWorkoutStore((s) => s.history);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const createTemplate = useTemplateStore((s) => s.createTemplate);

  const [showTemplateSheet, setShowTemplateSheet] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const shareCardRef = useRef<View>(null);

  const lastWorkout = history[0] ?? null;

  const prCount = useMemo(() => {
    if (!lastWorkout) return 0;
    return personalRecords.filter(
      (pr) => pr.workoutId === lastWorkout.id,
    ).length;
  }, [lastWorkout, personalRecords]);

  const insights = useMemo(() => {
    if (!lastWorkout) return [];
    return generateWorkoutInsights(lastWorkout, history, personalRecords);
  }, [lastWorkout, history, personalRecords]);

  const handleDone = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace('/(tabs)');
  };

  const captureShareCard = useCallback(async (): Promise<string | null> => {
    if (!shareCardRef.current) return null;
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });
      return uri;
    } catch {
      return null;
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const uri = await captureShareCard();
      if (!uri) {
        Alert.alert('Error', 'Could not generate share image.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {
      Alert.alert('Error', 'Failed to share workout.');
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, captureShareCard]);

  const handleSaveToGallery = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to save images.',
        );
        return;
      }

      const uri = await captureShareCard();
      if (!uri) {
        Alert.alert('Error', 'Could not generate image.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Saved', 'Workout card saved to your gallery!');
    } catch {
      Alert.alert('Error', 'Failed to save image.');
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, captureShareCard]);

  const handleSaveTemplate = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowTemplateSheet(true);
    if (lastWorkout) {
      setTemplateName(lastWorkout.name);
    }
  };

  const handleConfirmSaveTemplate = () => {
    if (!lastWorkout || !templateName.trim()) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const exercises: TemplateExercise[] = lastWorkout.exercises.map((ex) => {
      const completedSets = ex.sets.filter((s) => s.completed);
      const maxWeight =
        completedSets.length > 0
          ? Math.max(...completedSets.map((s) => s.weight))
          : 0;
      const avgReps =
        completedSets.length > 0
          ? Math.round(
              completedSets.reduce((s, set) => s + set.reps, 0) /
                completedSets.length,
            )
          : 10;

      return {
        exerciseId: ex.exerciseId,
        exercise: ex.exercise,
        targetSets: ex.sets.length,
        targetReps: avgReps,
        targetWeight: maxWeight > 0 ? maxWeight : undefined,
        restTimerSec: ex.restTimerSec,
      };
    });

    createTemplate({
      name: templateName.trim(),
      exercises,
      scheduledDays: selectedDays.length > 0 ? selectedDays : undefined,
    });

    setShowTemplateSheet(false);
  };

  const toggleDay = (day: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 24,
      color: colors.textPrimary,
    },
    statLabel: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 13,
      color: colors.textTertiary,
    },
    sectionTitle: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 18,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    breakdownName: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.textPrimary,
      flex: 1,
      marginRight: spacing.md,
    },
    emptyText: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 16,
      color: colors.textSecondary,
    },
    sheetTitle: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },
    nameInput: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 48,
      marginBottom: spacing.lg,
    },
    dayPickerLabel: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    dayButton: {
      flex: 1,
      height: 44,
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayButtonActive: {
      backgroundColor: `rgba(255, 107, 53, ${opacity['15']})`,
      borderColor: colors.primary,
    },
    dayButtonText: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 12,
      color: colors.textTertiary,
    },
    dayButtonTextActive: {
      color: colors.primary,
    },
    shareButtonLabel: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 16,
      color: colors.background,
    },
  }), [colors]);

  if (!lastWorkout) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.emptyContainer}>
          <Text style={dynamicStyles.emptyText}>No workout data</Text>
          <Button
            variant="primary"
            label="Go Home"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const stats = [
    {
      icon: Clock,
      label: 'Duration',
      value: formatDuration(lastWorkout.durationSec),
      color: colors.primary,
    },
    {
      icon: TrendingUp,
      label: 'Volume',
      value: lastWorkout.totalVolume.toLocaleString(),
      color: colors.health,
    },
    {
      icon: Hash,
      label: 'Sets',
      value: String(lastWorkout.totalSets),
      color: colors.water,
    },
    {
      icon: Trophy,
      label: 'PRs',
      value: String(prCount),
      color: prCount > 0 ? colors.pr : colors.textTertiary,
    },
  ];

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <CheckCircle size={48} color={colors.health} strokeWidth={1.5} />
          <Text style={dynamicStyles.title}>Workout Complete</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} variant="default" style={styles.statCard}>
                <Icon size={20} color={stat.color} strokeWidth={2} />
                <MonoText size={24} color={colors.textPrimary} weight="bold">
                  {stat.value}
                </MonoText>
                <Text style={dynamicStyles.statLabel}>{stat.label}</Text>
              </Card>
            );
          })}
        </View>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={dynamicStyles.sectionTitle}>Insights</Text>
            {insights.map((insight, idx) => (
              <InsightCard key={insight.type} insight={insight} index={idx} />
            ))}
          </View>
        )}

        <View style={styles.breakdownSection}>
          <Text style={dynamicStyles.sectionTitle}>Exercise Breakdown</Text>
          {lastWorkout.exercises.map((ex) => {
            const completedSets = ex.sets.filter((s) => s.completed).length;
            return (
              <View key={ex.id} style={dynamicStyles.breakdownRow}>
                <Text style={dynamicStyles.breakdownName} numberOfLines={1}>
                  {ex.exercise?.name ?? ex.exerciseId}
                </Text>
                <MonoText size={14} color={colors.textSecondary}>
                  {completedSets}/{ex.sets.length} sets
                </MonoText>
              </View>
            );
          })}
        </View>

        <View style={styles.actions}>
          {/* Share Workout button with gradient background */}
          <Pressable
            onPress={handleShare}
            disabled={isSharing}
            style={({ pressed }) => [
              styles.shareButton,
              pressed && styles.shareButtonPressed,
              isSharing && styles.disabled,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, '#FF8C42']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shareButtonGradient}
            >
              <Share2 size={18} color={colors.background} strokeWidth={2.5} />
              <Text style={dynamicStyles.shareButtonLabel}>Share Workout</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.secondaryActions}>
            <Button
              variant="secondary"
              label="Save to Gallery"
              onPress={handleSaveToGallery}
              icon={<Download size={16} color={colors.textPrimary} strokeWidth={2} />}
              disabled={isSharing}
              style={styles.halfButton}
            />
            <Button
              variant="secondary"
              label="Save as Template"
              onPress={handleSaveTemplate}
              style={styles.halfButton}
            />
          </View>

          <Button variant="primary" label="Done" onPress={handleDone} />
        </View>
      </ScrollView>

      {/* Hidden ShareCard for capture — positioned off-screen */}
      <View style={styles.hiddenShareCard} pointerEvents="none">
        <ShareCard
          ref={shareCardRef}
          workout={lastWorkout}
          prCount={prCount}
        />
      </View>

      <BottomSheet
        isOpen={showTemplateSheet}
        onClose={() => setShowTemplateSheet(false)}
        snapPoints={['45%']}
      >
        <Text style={dynamicStyles.sheetTitle}>Save as Template</Text>
        <TextInput
          style={dynamicStyles.nameInput}
          value={templateName}
          onChangeText={setTemplateName}
          placeholder="Template name"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={dynamicStyles.dayPickerLabel}>Schedule (optional)</Text>
        <View style={styles.dayPicker}>
          {DAY_LABELS.map((label, idx) => (
            <Pressable
              key={label}
              onPress={() => toggleDay(idx)}
              style={[
                dynamicStyles.dayButton,
                selectedDays.includes(idx) && dynamicStyles.dayButtonActive,
              ]}
            >
              <Text
                style={[
                  dynamicStyles.dayButtonText,
                  selectedDays.includes(idx) && dynamicStyles.dayButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button
          variant="primary"
          label="Save Template"
          onPress={handleConfirmSaveTemplate}
          disabled={!templateName.trim()}
          style={styles.saveButton}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  insightsSection: {
    marginBottom: spacing.xl,
  },
  breakdownSection: {
    marginBottom: spacing['2xl'],
  },
  actions: {
    gap: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  dayPicker: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  shareButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  shareButtonPressed: {
    opacity: 0.85,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  hiddenShareCard: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 0,
  },
});
