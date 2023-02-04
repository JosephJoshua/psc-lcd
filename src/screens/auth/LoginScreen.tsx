import { FC, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  Box,
  Button,
  FormControl,
  HStack,
  Icon,
  Input,
  Pressable,
  Text,
  VStack,
} from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

type FormValues = {
  email: string;
  password: string;
};

const formSchema = yup.object().shape({
  email: yup.string().email('Email harus valid').required('Email harus diisi'),
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

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleFormSubmit = (values: FormValues) => {
    setLoading(true);
    setLoginError('');

    signInWithEmailAndPassword(auth, values.email, values.password)
      .catch((err) => {
        const firebaseErr = err as FirebaseError;
        const errorCodes = [
          'user-not-found',
          'invalid-credential',
          'wrong-password',
        ];

        if (firebaseErr.code?.includes('too-many-requests')) {
          setLoginError(
            'Akses ke akun ini telah di non-aktifkan secara sementara karena terlalu banyak percobaan login.',
          );

          return;
        }

        if (errorCodes.some((code) => firebaseErr.code?.includes(code))) {
          setLoginError('Tidak dapat menemukan akun tersebut.');
        } else {
          setLoginError('Terjadi error yang tidak dikenali!');
          console.error(firebaseErr);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void trigger();
  }, []);

  return (
    <Box flex={1} pt="6" p="3" safeArea>
      <Text
        fontSize="3xl"
        fontWeight="semibold"
        color="primary.500"
        textAlign="center"
      >
        Selamat Datang
      </Text>

      <Text
        fontSize="lg"
        textAlign="center"
        color="blueGray.500"
        lineHeight="sm"
        px="4"
        mt="2"
      >
        Silahkan memasukan data Anda untuk memulai kembali.
      </Text>

      <VStack mt="8">
        <Controller
          control={control}
          name="email"
          defaultValue=""
          render={({
            field: { onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl isInvalid={error != null}>
              <Input
                {...field}
                onChangeText={(val) => onChange(val)}
                px="4"
                py="3"
                fontSize="md"
                backgroundColor="white"
                placeholder="Email"
                rightElement={
                  <Icon
                    as={Feather}
                    name={error == null ? 'check' : 'x'}
                    color={error == null ? 'green.500' : 'red.600'}
                    size="md"
                    mr="3"
                  />
                }
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="password"
          defaultValue=""
          render={({
            field: { onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl isInvalid={error != null}>
              <Input
                {...field}
                onChangeText={(val) => onChange(val)}
                mt="4"
                px="4"
                py="3"
                fontSize="md"
                backgroundColor="white"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                secureTextEntry={!showPassword}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect={false}
                rightElement={
                  <Pressable onPress={() => setShowPassword((val) => !val)}>
                    <Icon
                      as={Feather}
                      name={showPassword ? 'eye' : 'eye-off'}
                      color="gray.300"
                      size="md"
                      mr="3"
                    />
                  </Pressable>
                }
              />
            </FormControl>
          )}
        />

        {loginError && (
          <HStack alignItems="center" mt="3">
            <Icon
              as={Feather}
              name="alert-circle"
              size="md"
              color="red.500"
              mr="1.5"
            />

            <Text color="red.500" fontSize="md">
              {loginError}
            </Text>
          </HStack>
        )}

        <Button
          mt="4"
          py="2"
          variant="solid"
          onPress={handleSubmit(handleFormSubmit)}
          isLoading={isLoading}
          isDisabled={Object.values(formErrors).some((val) => val != null)}
          _text={{
            fontWeight: 'semibold',
            fontSize: 'md',
          }}
        >
          Masuk
        </Button>
      </VStack>

      {/* TODO: Add store name */}
    </Box>
  );
};

export default LoginScreen;
