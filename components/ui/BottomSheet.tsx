import React from 'react';
import { Modal, Pressable, View, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.textTertiary,
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 4,
  },
  content: {
    padding: 16,
    flex: 1,
  },
});
