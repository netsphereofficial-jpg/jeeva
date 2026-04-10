import React, { useMemo } from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

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
  const { colors } = useAppTheme();

  const dynamicStyles = useMemo(
    () => ({
      backdrop: {
        backgroundColor: colors.overlay,
      },
      sheet: {
        backgroundColor: colors.surfaceElevated,
      },
      handle: {
        backgroundColor: colors.textTertiary,
      },
    }),
    [colors],
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={[styles.backdrop, dynamicStyles.backdrop]}
          onPress={onClose}
        />
        <View style={[styles.sheet, dynamicStyles.sheet]}>
          <View style={[styles.handle, dynamicStyles.handle]} />
          <View style={styles.content}>
            {children}
          </View>
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
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 4,
  },
  content: {
    padding: 16,
    flex: 1,
    maxHeight: '100%',
  },
});
