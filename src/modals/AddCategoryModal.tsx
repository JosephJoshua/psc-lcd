import { FC, useState } from 'react';
import { collections } from '@/lib/firebase';
import { yupResolver } from '@hookform/resolvers/yup';
import { addDoc } from 'firebase/firestore';
import { Button, FormControl, Input, VStack } from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

type FormValues = {
  name: string;
};

const formSchema = yup.object().shape({
  name: yup.string().required('Nama harus diisi'),
});

export type AddCategoryModalProps = {
  onClose: () => void;
};

const AddCategoryModal: FC<AddCategoryModalProps> = ({ onClose }) => {
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
  });

  const [isLoading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = (values: FormValues) => {
    setLoading(true);

    addDoc(collections.categories, {
      name: values.name,
      screens: [],
    })
      .then(() => {
        onClose();
        setValue('name', '');
      })
      .finally(() => setLoading(false));
  };

  return (
    <VStack width="full" pt="3" pb="5" px="4">
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
        Tambah
      </Button>
    </VStack>
  );
};

export default AddCategoryModal;
