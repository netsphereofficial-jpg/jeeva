import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches render errors and shows a beautiful fallback UI.
 * Wrap screens or major sections with this component.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={32} color="#FF6B35" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <Pressable onPress={this.handleRetry} style={styles.retryButton}>
            <RefreshCw size={18} color="#E8E4DE" strokeWidth={2} />
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,107,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: '#E8E4DE',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#9B9B9B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  retryText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: '#E8E4DE',
  },
});
