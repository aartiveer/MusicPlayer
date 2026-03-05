import React, { ReactNode, useEffect, useRef } from "react";
import { Modal, Pressable, StyleSheet, Animated, View } from "react-native";

export default function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    slide.setValue(0);
    Animated.timing(slide, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [visible, slide]);

  if (!visible) return null;

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [280, 0],
  });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 10,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#E8E8E8",
    alignSelf: "center",
    marginBottom: 12,
  },
});