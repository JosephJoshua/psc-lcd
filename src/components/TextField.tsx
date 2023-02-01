import { ReactNode, forwardRef, useState } from 'react';
import { StyleSheet, TextInputProps, View } from 'react-native';
import {
  NativeViewGestureHandlerProps,
  TextInput,
} from 'react-native-gesture-handler';
import { HBox, VBox } from '@/lib/styled/layout';
import theme from '@/theme';

export type TextFieldProps = TextInputProps &
  NativeViewGestureHandlerProps & {
    hasError?: boolean;
    right?: ReactNode;
  };

const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ style, hasError, right, ...props }, ref) => {
    const [isFocus, setFocus] = useState<boolean>(false);

    return (
      <VBox style={style}>
        <HBox items="center">
          <TextInput
            ref={ref}
            {...props}
            style={[
              styles.input,
              isFocus && styles.inputFocus,
              hasError && styles.inputError,
            ]}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />

          <View style={styles.right}>{right}</View>
        </HBox>
      </VBox>
    );
  },
);

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.lightgray,
    fontSize: theme.fontSize.sm,
    flex: 1,
  },
  inputFocus: {
    borderColor: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.red,
  },
  right: {
    position: 'absolute',
    right: theme.spacing.sm,
  },
});

export default TextField;
