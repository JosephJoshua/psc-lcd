import { FC, useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { auth } from '@/lib/firebase';
import { VBox } from '@/lib/styled/layout';
import { Text } from '@/lib/styled/text';
import theme from '@/theme';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

type FormValues = {
  email: string;
  password: string;
};

const formSchema = yup
  .object<Partial<Record<keyof FormValues, yup.AnySchema>>>()
  .shape({
    email: yup
      .string()
      .email('Email harus valid')
      .required('Email harus diisi'),
    password: yup.string().required('Password harus diisi'),
  });

const LoginScreen: FC = () => {
  const {
    handleSubmit,
    control,
    trigger,
    formState: { errors: formErrors },
  } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    mode: 'onChange',
  });

  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (values: FormValues) => {
    setLoading(true);

    signInWithEmailAndPassword(auth, values.email, values.password)
      .catch((err) => {
        const firebaseErr = err as FirebaseError;
        const errorCodes = [
          'user-not-found',
          'invalid-credential',
          'wrong-password',
        ];

        if (firebaseErr.code?.includes('too-many-requests')) {
          setError(
            'Akses ke akun ini telah di non-aktifkan secara sementara karena terlalu banyak percobaan login.',
          );

          return;
        }

        if (errorCodes.some((code) => firebaseErr.code?.includes(code))) {
          setError('Tidak dapat menemukan akun tersebut.');
        } else {
          setError('Terjadi error yang tidak dikenali!');
          console.error(firebaseErr);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void trigger();
  }, []);

  return (
    <VBox
      style={{
        paddingTop: insets.top + theme.spacing.xl,
        paddingBottom: insets.bottom + theme.spacing.md,
        paddingLeft: insets.left + theme.spacing.md,
        paddingRight: insets.right + theme.spacing.md,
        flex: 1,
      }}
      justify="between"
    >
      <VBox>
        <Text size="xl" weight="semibold" color="primary" align="center">
          Selamat Datang
        </Text>

        <Text
          size="md"
          align="center"
          color="slate"
          lineHeight={1.4}
          px="md"
          my="md"
        >
          Silahkan memasukan data Anda untuk memulai kembali.
        </Text>

        <VBox mt="sm">
          <Controller
            control={control}
            name="email"
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <TextField
                {...field}
                right={
                  <Feather
                    name={error == null ? 'check' : 'x'}
                    color={
                      error == null ? theme.colors.green : theme.colors.red
                    }
                    size={20}
                  />
                }
                hasError={error != null}
                style={{ marginBottom: theme.spacing.md }}
                onChangeText={(value) => onChange(value)}
                placeholder="Email"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoFocus
              />
            )}
            defaultValue=""
          />

          <Controller
            control={control}
            name="password"
            render={({
              field: { onChange, ...field },
              fieldState: { error },
            }) => (
              <TextField
                {...field}
                right={
                  <Pressable onPress={() => setShowPassword((val) => !val)}>
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={theme.colors.gray}
                    />
                  </Pressable>
                }
                hasError={error != null}
                onChangeText={(value) => onChange(value)}
                placeholder="Password"
                autoCorrect={false}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
              />
            )}
            defaultValue=""
          />

          {error && (
            <Text mt="sm" color="red">
              {error}
            </Text>
          )}

          <Button
            style={{ marginTop: theme.spacing.md }}
            title="Masuk"
            variant="primary"
            onPress={handleSubmit(handleFormSubmit)}
            isLoading={isLoading}
            isDisabled={Object.values(formErrors).some((val) => val != null)}
          />
        </VBox>
      </VBox>

      <Text color="primary" align="center" size="md" weight="semibold">
        Point Service Center
      </Text>
    </VBox>
  );
};

export default LoginScreen;
