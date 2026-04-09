import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
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
  snapPoints: snapPointsProp,
  children,
}: BottomSheetProps) {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);
  const snapPoints = useMemo(
    () => snapPointsProp ?? ['50%', '80%'],
    [snapPointsProp],
  );

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        style={[props.style, { backgroundColor: colors.overlay }]}
      />
    ),
    [],
  );

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      index={isOpen ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>{children}</BottomSheetView>
    </GorhomBottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    backgroundColor: colors.textTertiary,
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
