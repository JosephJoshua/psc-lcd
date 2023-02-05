import { FC, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { CATEGORIES, collections, db } from '@/lib/firebase';
import Category from '@/types/category';
import { Feather } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  arrayUnion,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import {
  Actionsheet,
  Box,
  Button,
  FormControl,
  HStack,
  Icon,
  IconButton,
  Input,
  KeyboardAvoidingView,
  Select,
  Text,
  VStack,
} from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import AddCategoryModal from './AddCategoryModal';

type FormValues = {
  name: string;
  categoryId: string;
};

const formSchema = yup.object().shape({
  name: yup.string().required('Nama layar harus diisi'),
  categoryId: yup.string().required('Kategori layar harus dipilih'),
});

export type AddScreenModalProps = {
  onClose: () => void;
};

const AddScreenModal: FC<AddScreenModalProps> = ({ onClose }) => {
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
  });

  const { height: windowHeight } = useWindowDimensions();

  const [addCategoryModalOpen, setAddCategoryModalOpen] =
    useState<boolean>(false);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [categoryData, setCategoryData] = useState<Category[]>([]);

  const handleFormSubmit = (values: FormValues) => {
    console.log(values);

    setLoading(true);

    const categoryRef = doc(db, CATEGORIES, values.categoryId);
    updateDoc(categoryRef, {
      screens: arrayUnion(values.name),
    })
      .then(() => {
        onClose();

        setValue('name', '');
        setValue('categoryId', '');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collections.categories, orderBy('name')),
      (snapshot) =>
        setCategoryData(
          snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })),
        ),
    );

    return () => unsubscribe();
  }, []);

  return (
    <VStack pt="3" pb="5" px="4" width="full">
      <HStack justifyContent="space-between" alignItems="center" mb="3">
        <Text fontSize="2xl" color="primary.500" fontWeight="semibold">
          Tambah layar
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
            <FormControl.Label>Nama Layar</FormControl.Label>
            <Input
              {...field}
              onChangeText={(val) => onChange(val)}
              px="4"
              py="3"
              fontSize="md"
              backgroundColor="white"
              placeholder="Nama Layar..."
              autoComplete="off"
              autoCapitalize="words"
              selectionColor="primary.500"
            />
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormControl mt="4" isInvalid={error != null}>
            <FormControl.Label>Kategori Layar</FormControl.Label>
            <Select
              selectedValue={value}
              onValueChange={(val) => onChange(val)}
              px="4"
              py="3"
              fontSize="md"
              backgroundColor="white"
              placeholder="Pilih Kategori Layar.."
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
              _actionSheetContent={{
                height: Math.min(
                  windowHeight,
                  Math.max(windowHeight * 0.8 - 10, 400),
                ),
                paddingBottom: 10,
              }}
              _actionSheetBody={{
                ListHeaderComponent: (
                  <CategorySelectHeader
                    onAdd={() => setAddCategoryModalOpen(true)}
                    searchText={searchText}
                    setSearchText={setSearchText}
                  />
                ),
              }}
            >
              {categoryData
                .filter((cat) =>
                  cat.name.toLowerCase().includes(searchText.toLowerCase()),
                )
                .map((cat) => (
                  <Select.Item label={cat.name} value={cat.id} key={cat.id} />
                ))}
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

      <Actionsheet
        isOpen={addCategoryModalOpen}
        onClose={() => setAddCategoryModalOpen(false)}
        size="full"
      >
        <KeyboardAvoidingView behavior="padding" width="full">
          <Actionsheet.Content>
            <AddCategoryModal onClose={() => setAddCategoryModalOpen(false)} />
          </Actionsheet.Content>
        </KeyboardAvoidingView>
      </Actionsheet>
    </VStack>
  );
};

type CategorySelectHeaderProps = {
  searchText: string;
  setSearchText: (newVal: string) => void;
  onAdd: () => void;
};

const CategorySelectHeader: FC<CategorySelectHeaderProps> = ({
  searchText,
  setSearchText,
  onAdd,
}) => {
  return (
    <HStack alignItems="center">
      <Box flex={1}>
        <CategorySearchBox
          searchText={searchText}
          onSearchTextChange={setSearchText}
        />
      </Box>

      <IconButton
        backgroundColor="gray.100"
        rounded="full"
        icon={<Icon as={Feather} name="plus" size="md" />}
        onPress={() => onAdd()}
        _pressed={{
          backgroundColor: 'gray.200',
        }}
      />
    </HStack>
  );
};

type CategorySearchBoxProps = {
  searchText: string;
  onSearchTextChange: (newVal: string) => void;
};

/**
 * Extracted into its own component so the
 * modal re-rendering doesn't hide and show the keyboard.
 */
const CategorySearchBox: FC<CategorySearchBoxProps> = ({
  searchText,
  onSearchTextChange,
}) => {
  return (
    <FormControl px="3" mb="3" mt="4">
      <Input
        py="2"
        fontSize="md"
        placeholder="Cari..."
        value={searchText}
        onChangeText={onSearchTextChange}
        backgroundColor="gray.50"
        type="text"
        autoCapitalize="none"
      />
    </FormControl>
  );
};

export default AddScreenModal;
