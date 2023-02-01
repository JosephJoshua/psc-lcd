import { forwardRef } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import tailwindConfig from '@/utils/tailwindConfig';
import clsx from 'clsx';
import { styled } from 'nativewind';

export type ButtonProps = PressableProps & {
  title: string;
  variant: keyof typeof variantClasses;
  style?: StyleProp<ViewStyle>;
};

const variantClasses = {
  primary: clsx('bg-primary px-4 py-2 rounded-md'),
};

const variantTextClasses: Record<keyof typeof variantClasses, string> = {
  primary: clsx('text-white text-lg text-center font-semibold'),
};

const variantStyles: Record<
  keyof typeof variantClasses,
  StyleProp<ViewStyle>
> = {
  primary: {
    shadowColor: tailwindConfig.theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
};

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
        className={clsx(variantClasses[variant], props.className)}
        style={[variantStyles[variant], style]}
      >
        <Text className={variantTextClasses[variant]}>{title}</Text>
      </Pressable>
    );
  },
);

export default styled(Button, {
  props: {
    className: true,
  },
});
