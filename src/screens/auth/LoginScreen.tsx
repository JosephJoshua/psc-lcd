import { FC } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import * as yup from 'yup';

const formSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(32).required(),
});

const LoginScreen: FC = () => {
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(formSchema),
  });

  const insets = useSafeAreaInsets();

  const handleFormSubmit = (values: FieldValues) => {
    console.log(values);
  };

  return (
    <View
      className="flex flex-col gap-6"
      style={{
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 16,
        paddingRight: insets.right + 16,
      }}
    >
      <Text className="text-3xl text-primary font-semibold text-center">
        Selamat Datang
      </Text>

      <Text className="text-center text-lg leading-6 px-8 break-words text-slate-600">
        Silahkan memasukan data Anda untuk memulai kembali.
      </Text>

      <View className="flex flex-col">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, ...field } }) => (
            <TextField
              {...field}
              onChangeText={(value) => onChange(value)}
              className="mb-5"
              label="Email"
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoFocus
              withAsterisk
            />
          )}
          defaultValue=""
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, ...field } }) => (
            <TextField
              {...field}
              onChangeText={(value) => onChange(value)}
              label="Password"
              autoCorrect={false}
              autoCapitalize="none"
              secureTextEntry
              withAsterisk
            />
          )}
          defaultValue=""
        />

        <Button
          title="Masuk"
          variant="primary"
          className="mt-5"
          onPress={handleSubmit(handleFormSubmit)}
        />
      </View>
    </View>
  );
};

export default LoginScreen;
