import { ReactNode, forwardRef } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '@/theme';

export type IconButtonProps = PressableProps & {
  icon: ReactNode;
  size: number;
  style?: StyleProp<ViewStyle>;
};

const IconButton = forwardRef<View, IconButtonProps>(
  ({ icon, onPress, size, style, ...props }, ref) => {
    const handlePress = (event: GestureResponderEvent) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(event);
    };

    return (
      <Pressable
        {...props}
        onPress={handlePress}
        ref={ref}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      >
        {icon}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconButton;
