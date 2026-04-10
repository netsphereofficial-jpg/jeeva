# JEEVA

**Premium Gym & Health Companion App**

A dark luxury fitness app that unifies workout tracking, health monitoring, hydration, alarms, and medication reminders — all in one beautiful interface.

## Features

- **Dashboard** — Time-based greeting, quick stats rings (steps, calories, heart rate), water tracker, sleep analysis, weekly steps chart
- **Workout Engine** — Muscle group picker, active workout with set logging, rest timer overlay, PR detection with gold badges, workout templates with auto-progression
- **Water Tracker** — Circular progress ring, quick-add buttons (+150/250/500ml), undo, daily goal tracking
- **Alarms** — Three types (Wake-Up, Workout, Medication) with day-of-week scheduling and local notifications
- **Medication Reminders** — Daily checklist with animated checkboxes, streak tracking, 30-day calendar heatmap
- **Health Integration** — Steps, heart rate, sleep data via HealthKit (iOS) / Health Connect (Android), auto-sync

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 52+, Expo Router) |
| Language | TypeScript (strict mode, zero `any`) |
| State | Zustand + AsyncStorage persistence |
| Animations | React Native Reanimated 3 |
| Icons | Lucide React Native |
| Notifications | expo-notifications |
| Health | react-native-health (iOS) / expo-health-connect (Android) |
| Haptics | expo-haptics |
| Fonts | DM Sans (UI) + Space Mono (data/numbers) |

## Design

- **Dark luxury UI** — Matte black (#0A0A0F), warm white text, frosted glass cards
- **Semantic color system** — Orange (energy), purple (sleep), green (health), blue (water), red (heart), gold (PRs)
- **Dual typography** — DM Sans for UI, Space Mono for all numbers
- **Haptic feedback** on every interaction
- **Animated entrances** — Staggered card animations, spring-filled progress rings

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Project Structure

```
jeeva/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # 4 bottom tabs (Home, Workout, Alarms, Health)
│   └── workout/            # Workout flow (new, active, summary)
├── components/
│   ├── ui/                 # Base components (Card, Button, CircularProgress, etc.)
│   ├── dashboard/          # Dashboard cards (QuickStats, WaterTracker, SleepCard)
│   ├── workout/            # Workout components (SetRow, RestTimer, PRBadge)
│   ├── alarms/             # Alarm & medication components
│   └── health/             # Health metric components
├── hooks/                  # Custom hooks (useWorkout, useRestTimer, etc.)
├── stores/                 # Zustand stores (7 stores with persistence)
├── services/               # Health service abstraction, notifications
├── data/                   # Exercise database (~80 exercises)
├── theme/                  # Design tokens (colors, typography, spacing)
├── types/                  # TypeScript interfaces
└── utils/                  # Formatters, calculations (PR detection, progression)
```

## License

MIT
