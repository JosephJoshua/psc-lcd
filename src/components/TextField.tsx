import { ReactNode, forwardRef } from 'react';
import { Text, TextInputProps, View } from 'react-native';
import {
  NativeViewGestureHandlerProps,
  TextInput,
} from 'react-native-gesture-handler';
import clsx from 'clsx';
import { styled } from 'nativewind';

export type TextFieldProps = TextInputProps &
  NativeViewGestureHandlerProps & {
    label?: ReactNode;
    withAsterisk?: boolean;
  };

const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ className, label, withAsterisk, ...props }, ref) => {
    return (
      <View className="flex flex-col gap-0.5">
        <View className="flex flex-row items-center">
          <Text className="text-lg font-semibold">{label}</Text>
          {withAsterisk && (
            <Text className="text-red-600 ml-1 font-semibold">*</Text>
          )}
        </View>

        <TextInput
          className={clsx(
            'px-3 py-3 rounded-md border border-gray-500 shadow w-full bg-gray-50 transition-all duration-200 focus:border-primary focus:bg-white',
            className,
          )}
          ref={ref}
          {...props}
        />
      </View>
    );
  },
);

export default styled(TextField, {
  props: { className: true },
});
