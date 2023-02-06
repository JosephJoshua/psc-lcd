import { FC, useState } from 'react';
import { auth, collections } from '@/lib/firebase';
import { UserRole } from '@/types/user';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc } from 'firebase/firestore';
import {
  Button,
  FormControl,
  HStack,
  Icon,
  IconButton,
  Input,
  Select,
  Text,
  VStack,
} from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

type FormValues = {
  email: string;
  username: string;
  password: string;
  role: UserRole;
};

const formSchema = yup.object().shape({
  email: yup.string().required('Email harus diisi').email('Email harus valid'),
  username: yup.string().required('Username harus diisi'),
  password: yup
    .string()
    .required('Password harus diisi')
    .min(8, 'Password harus 8 karakter atau lebih'),
  role: yup.string().required('Role harus dipilih'),
});

/**
 * We can use a type intersection but this is good enough for now.
 */
export type AddUserModalProps = {
  onClose: () => void;
};

const AddUserModal: FC<AddUserModalProps> = ({ onClose }) => {
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
  });

  const [isLoading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = (values: FormValues) => {
    setLoading(true);

    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(() =>
        addDoc(collections.users, {
          username: values.username,
          role: values.role,
        }),
      )
      .then(() => {
        onClose();
        setValue('username', '');
      })
      .finally(() => setLoading(false));
  };

  return (
    <VStack width="full" pt="3" pb="5" px="4">
      <HStack justifyContent="space-between" alignItems="center" mb="3">
        <Text fontSize="2xl" color="primary.500" fontWeight="semibold">
          Tambah pengguna
        </Text>

        <IconButton
          onPress={() => onClose()}
          icon={<Icon as={Feather} name="x" size="md" color="black" />}
          backgroundColor="gray.100"
          size="lg"
          p="2"
          rounded="full"
          _pressed={{
            bgColor: 'gray.200',
          }}
        />
      </HStack>

      <Controller
        control={control}
        name="email"
        defaultValue=""
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl isInvalid={error != null}>
            <FormControl.Label>Email Pengguna</FormControl.Label>
            <Input
              {...field}
              onChangeText={(val) => onChange(val)}
              px="4"
              py="3"
              fontSize="md"
              backgroundColor="white"
              placeholder="Email Pengguna..."
              autoComplete="email"
              autoCapitalize="none"
              keyboardType="email-address"
              selectionColor="primary.500"
            />
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="username"
        defaultValue=""
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl isInvalid={error != null} mt="4">
            <FormControl.Label>Nama Pengguna</FormControl.Label>
            <Input
              {...field}
              onChangeText={(val) => onChange(val)}
              px="4"
              py="3"
              fontSize="md"
              backgroundColor="white"
              placeholder="Nama Pengguna..."
              autoComplete="off"
              autoCapitalize="sentences"
              selectionColor="primary.500"
            />
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="password"
        defaultValue=""
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl mt="4" isInvalid={error != null}>
            <FormControl.Label>Password Pengguna</FormControl.Label>
            <Input
              {...field}
              onChangeText={(val) => onChange(val)}
              px="4"
              py="3"
              fontSize="md"
              backgroundColor="white"
              placeholder="Password Pengguna..."
              autoComplete="off"
              autoCapitalize="sentences"
              selectionColor="primary.500"
              type="password"
              secureTextEntry
            />
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="role"
        defaultValue="employee"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormControl mt="4" isInvalid={error != null}>
            <FormControl.Label>Role Pengguna</FormControl.Label>
            <Select
              selectedValue={value}
              onValueChange={(val) => onChange(val)}
              px="4"
              py="3"
              fontSize="md"
              backgroundColor="white"
              placeholder="Pilih Role Pengguna..."
              dropdownOpenIcon={
                <Icon as={Feather} name="chevron-down" size="lg" mr="2" />
              }
              dropdownCloseIcon={
                <Icon as={Feather} name="chevron-up" size="lg" mr="2" />
              }
              _item={{
                rounded: 'lg',
                _pressed: {
                  backgroundColor: 'gray.200',
                },
              }}
            >
              <Select.Item label="Admin" value="admin" />
              <Select.Item label="Karyawan" value="employee" />
            </Select>
          </FormControl>
        )}
      />

      <Button
        variant="solid"
        rounded="3xl"
        mt="5"
        _text={{
          fontWeight: 'semibold',
          fontSize: 'md',
        }}
        onPress={handleSubmit(handleFormSubmit)}
        isLoading={isLoading}
      >
        Tambah
      </Button>
    </VStack>
  );
};

export default AddUserModal;
