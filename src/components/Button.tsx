import { forwardRef } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '@/theme';

export type ButtonProps = PressableProps & {
  title: string;
  variant: keyof typeof containerStyles;
  style?: StyleProp<ViewStyle>;
};

const containerStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
    pddaddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: 'white',
    textAlign: 'center',
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
});

const Button = forwardRef<View, ButtonProps>(
  ({ title, variant, style, onPress, ...props }, ref) => {
    const handlePress = (event: GestureResponderEvent) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(event);
    };

    return (
      <Pressable
        {...props}
        onPress={handlePress}
        ref={ref}
        style={[containerStyles[variant], style]}
      >
        <Text style={textStyles[variant]}>{title}</Text>
      </Pressable>
    );
  },
);

export default Button;
