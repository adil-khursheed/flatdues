import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ComponentRef,
  ForwardedRef,
  ReactNode,
} from "react";
import {
  AccessibilityInfo,
  BackHandler,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReduceMotion } from "react-native-reanimated";

import { icons } from "@/lib/icons";
import { spacing, useAppTheme } from "@/theme";

import { AppText } from "./app-text";
import { IconButton } from "./icon-button";
import { AppBottomSheetKeyboardAwareScrollView } from "./app-bottom-sheet-keyboard-aware-scroll-view";

export type AppBottomSheetModalRef = ComponentRef<typeof BottomSheetModal>;

type ManagedBottomSheetProps =
  | "android_keyboardInputMode"
  | "backdropComponent"
  | "backgroundStyle"
  | "bottomInset"
  | "children"
  | "enableBlurKeyboardOnGesture"
  | "enablePanDownToClose"
  | "handleIndicatorStyle"
  | "keyboardBehavior"
  | "keyboardBlurBehavior"
  | "maxDynamicContentSize"
  | "onChange"
  | "onDismiss"
  | "overrideReduceMotion"
  | "topInset";

export type AppBottomSheetModalProps = Omit<
  BottomSheetModalProps,
  ManagedBottomSheetProps
> & {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  description?: string;
  keyboardAware?: boolean;
  onChange?: (index: number) => void;
  onDismiss?: () => void;
  scrollable?: boolean;
  showCloseButton?: boolean;
  title?: string;
};

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const AppBottomSheetModal = forwardRef<
  AppBottomSheetModalRef,
  AppBottomSheetModalProps
>(function AppBottomSheetModal(
  {
    children,
    contentStyle,
    description,
    keyboardAware = false,
    onChange,
    onDismiss,
    scrollable = false,
    showCloseButton = true,
    stackBehavior = "push",
    title,
    ...props
  },
  forwardedRef,
) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { dismiss } = useBottomSheetModal();
  const modalRef = useRef<AppBottomSheetModalRef>(null);
  const [isPresented, setIsPresented] = useState(false);
  const isPresentedRef = useRef(false);

  const setModalRef = useCallback(
    (value: AppBottomSheetModalRef | null) => {
      modalRef.current = value;
      assignRef(forwardedRef, value);
    },
    [forwardedRef],
  );

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        accessibilityLabel="Dismiss sheet"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={isDark ? 0.62 : 0.42}
        pressBehavior="close"
      />
    ),
    [isDark],
  );

  const handleChange = useCallback(
    (index: number) => {
      const nextIsPresented = index >= 0;
      setIsPresented(nextIsPresented);

      if (nextIsPresented && !isPresentedRef.current) {
        AccessibilityInfo.announceForAccessibility(
          title ? `${title} opened` : "Sheet opened",
        );
      }

      isPresentedRef.current = nextIsPresented;
      onChange?.(index);
    },
    [onChange, title],
  );

  const handleDismiss = useCallback(() => {
    setIsPresented(false);
    isPresentedRef.current = false;
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (!isPresented) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        modalRef.current?.dismiss();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isPresented]);

  const resolvedContentStyle = [
    styles.content,
    { paddingBottom: Math.max(insets.bottom, spacing.md) },
    contentStyle,
  ];
  const header = title ? (
    <>
      <AppText accessibilityRole="header" variant="heading">
        {title}
      </AppText>
      {description ? (
        <AppText tone="muted">{description}</AppText>
      ) : null}
      {showCloseButton ? (
        <IconButton
          accessibilityLabel={`Close ${title}`}
          icon={icons.actions.close}
          onPress={() => dismiss()}
          style={styles.closeButton}
        />
      ) : null}
    </>
  ) : null;

  return (
    <BottomSheetModal
      ref={setModalRef}
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      bottomInset={insets.bottom}
      enableBlurKeyboardOnGesture
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      maxDynamicContentSize={Math.max(
        windowHeight - insets.top - spacing.lg,
        320,
      )}
      onChange={handleChange}
      onDismiss={handleDismiss}
      overrideReduceMotion={ReduceMotion.System}
      stackBehavior={stackBehavior}
      topInset={insets.top}
      {...props}
    >
      {scrollable || keyboardAware ? (
        keyboardAware ? (
          <AppBottomSheetKeyboardAwareScrollView
            accessibilityViewIsModal
            bottomOffset={spacing.md}
            contentContainerStyle={resolvedContentStyle}
            importantForAccessibility="yes"
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          >
            {header}
            {children}
          </AppBottomSheetKeyboardAwareScrollView>
        ) : (
          <BottomSheetScrollView
          accessibilityViewIsModal
          contentContainerStyle={resolvedContentStyle}
          importantForAccessibility="yes"
          keyboardShouldPersistTaps="handled"
          >
            {header}
            {children}
          </BottomSheetScrollView>
        )
      ) : (
        <BottomSheetView
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={resolvedContentStyle}
        >
          {header}
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    right: spacing.md,
    top: spacing.xs,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});

AppBottomSheetModal.displayName = "AppBottomSheetModal";

export {
  BottomSheetFlatList as AppBottomSheetFlatList,
  BottomSheetScrollView as AppBottomSheetScrollView,
  BottomSheetSectionList as AppBottomSheetSectionList,
} from "@gorhom/bottom-sheet";
