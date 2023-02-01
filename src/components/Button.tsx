import { forwardRef } from 'react';
import {
  ActivityIndicator,
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

export type ButtonVariants = 'primary';

export type ButtonProps = PressableProps & {
  title: string;
  variant: ButtonVariants;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
  isDisabled?: boolean;
};

const Button = forwardRef<View, ButtonProps>(
  (
    { title, variant, style, onPress, isLoading, isDisabled, ...props },
    ref,
  ) => {
    const handlePress = (event: GestureResponderEvent) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(event);
    };

    return (
      <Pressable
        {...props}
        onPress={handlePress}
        ref={ref}
        disabled={isDisabled}
        style={[
          baseStyles.container,
          containerStyles[variant],
          isDisabled && containerDisabledStyles[variant],
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            style={[
              textStyles[variant],
              isDisabled && textDisabledStyles[variant],
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    );
  },
);

const baseStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const containerStyles: Record<ButtonVariants, object> = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

const containerDisabledStyles: Record<ButtonVariants, object> =
  StyleSheet.create({
    primary: {
      backgroundColor: theme.colors.lightgray,
      shadowColor: 'transparent',
    },
  });

const textStyles: Record<ButtonVariants, object> = StyleSheet.create({
  primary: {
    color: 'white',
    textAlign: 'center',
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
});

const textDisabledStyles: Record<ButtonVariants, object> = StyleSheet.create({
  primary: {
    color: theme.colors.gray,
  },
});

export default Button;
