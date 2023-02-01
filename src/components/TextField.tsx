import { ReactNode, forwardRef } from 'react';
import { StyleSheet, TextInputProps } from 'react-native';
import {
  NativeViewGestureHandlerProps,
  TextInput,
} from 'react-native-gesture-handler';
import { HBox, VBox } from '@/lib/styled/layout';
import { Text } from '@/lib/styled/text';
import theme from '@/theme';

export type TextFieldProps = TextInputProps &
  NativeViewGestureHandlerProps & {
    label?: ReactNode;
    withAsterisk?: boolean;
  };

const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, style, withAsterisk, ...props }, ref) => {
    return (
      <VBox>
        <HBox items="center" mb="xs">
          <Text size="sm" weight="semibold">
            {label}
          </Text>

          {withAsterisk && (
            <Text weight="semibold" color="red" ml="xs">
              *
            </Text>
          )}
        </HBox>

        <TextInput ref={ref} {...props} style={[styles.input, style]} />
      </VBox>
    );
  },
);

const styles = StyleSheet.create({
  input: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    width: '100%',
    backgroundColor: theme.colors.lightgray,
    border: `1px solid ${theme.colors.gray}`,
    fontSize: theme.fontSize.sm,
  },
});

export default TextField;
