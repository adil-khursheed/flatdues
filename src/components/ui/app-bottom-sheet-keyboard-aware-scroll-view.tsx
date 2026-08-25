import {
  createBottomSheetScrollableComponent,
  SCROLLABLE_TYPE,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetScrollableProps,
  BottomSheetScrollViewMethods,
} from "@gorhom/bottom-sheet";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";
import Reanimated from "react-native-reanimated";

export type AppBottomSheetKeyboardAwareScrollViewProps =
  KeyboardAwareScrollViewProps & BottomSheetScrollableProps;

const AnimatedKeyboardAwareScrollView = Reanimated.createAnimatedComponent(
  KeyboardAwareScrollView,
);

export const AppBottomSheetKeyboardAwareScrollView =
  createBottomSheetScrollableComponent<
    BottomSheetScrollViewMethods,
    AppBottomSheetKeyboardAwareScrollViewProps
  >(SCROLLABLE_TYPE.SCROLLVIEW, AnimatedKeyboardAwareScrollView);

AppBottomSheetKeyboardAwareScrollView.displayName =
  "AppBottomSheetKeyboardAwareScrollView";
