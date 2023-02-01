import { FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { VBox } from '@/lib/styled/layout';
import { Text } from '@/lib/styled/text';
import theme from '@/theme';
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
    <VBox
      style={{
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 16,
        paddingRight: insets.right + 16,
      }}
    >
      <Text size="xl" weight="semibold" color="primary" align="center">
        Selamat Datang
      </Text>

      <Text
        size="sm"
        align="center"
        color="slate"
        lineHeight={1.4}
        px="md"
        my="md"
      >
        Silahkan memasukan data Anda untuk memulai kembali.
      </Text>

      <VBox>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, ...field } }) => (
            <TextField
              {...field}
              style={{ marginBottom: theme.spacing.md }}
              onChangeText={(value) => onChange(value)}
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
          style={{ marginTop: theme.spacing.md }}
          title="Masuk"
          variant="primary"
          onPress={handleSubmit(handleFormSubmit)}
        />
      </VBox>
    </VBox>
  );
};

export default LoginScreen;
