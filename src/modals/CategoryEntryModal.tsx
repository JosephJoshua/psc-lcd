import { FC, useState } from 'react';
import { collections } from '@/lib/firebase';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { addDoc, doc, updateDoc } from 'firebase/firestore';
import {
  Button,
  FormControl,
  HStack,
  Icon,
  IconButton,
  Input,
  Text,
  VStack,
} from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

type FormValues = {
  name: string;
};

const formSchema = yup.object().shape({
  name: yup.string().required('Nama harus diisi'),
});

/**
 * We can use a type intersection but this is good enough for now.
 */
export type CategoryEntryModalProps = {
  type: 'add' | 'edit';
  initialValues?: FormValues;
  categoryId?: string;
  onClose: () => void;
};

const CategoryEntryModal: FC<CategoryEntryModalProps> = ({
  onClose,
  initialValues,
  categoryId,
  type,
}) => {
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    values: initialValues,
  });

  const [isLoading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = (values: FormValues) => {
    setLoading(true);

    const promise =
      type === 'add'
        ? addDoc(collections.categories, {
            name: values.name,
            screens: [],
          })
        : updateDoc(doc(collections.categories, categoryId), {
            name: values.name,
          });

    promise
      .then(() => {
        onClose();
        setValue('name', '');
      })
      .finally(() => setLoading(false));
  };

  return (
    <VStack width="full" pt="3" pb="5" px="4">
      <HStack justifyContent="space-between" alignItems="center" mb="3">
        <Text fontSize="2xl" color="primary.500" fontWeight="semibold">
          {type === 'add' ? 'Tambah' : 'Ubah'} kategori
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
        name="name"
        defaultValue=""
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl isInvalid={error != null}>
            <FormControl.Label>Nama Kategori</FormControl.Label>
            <Input
              {...field}
              onChangeText={(val) => onChange(val)}
              px="4"
              py="3"
              fontSize="md"
              backgroundColor="white"
              placeholder="Nama Kategori..."
              autoComplete="off"
              autoCapitalize="sentences"
              selectionColor="primary.500"
            />
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
        {type === 'add' ? 'Tambah' : 'Simpan'}
      </Button>
    </VStack>
  );
};

export default CategoryEntryModal;
