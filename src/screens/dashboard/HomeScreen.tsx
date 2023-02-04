import { FC, useEffect, useMemo, useState } from 'react';
import { collections } from '@/lib/firebase';
import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  Actionsheet,
  Box,
  Icon,
  IconButton,
  KeyboardAvoidingView,
  Text,
  VStack,
} from 'native-base';

import AddScreenModal from '../../modals/AddScreenModal';

type ListItem = {
  type: 'row' | 'sectionHeader';
  value: string;
};

const HomeScreen: FC = () => {
  const [data, setData] = useState<ListItem[]>([]);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);

  const stickyHeaderIndices = useMemo(
    () =>
      data
        .map((item, idx) => {
          return typeof item === 'string' ? idx : null;
        })
        .filter(Boolean) as number[],
    [data],
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collections.categories, orderBy('name')),
      (snapshot) => {
        setData(
          snapshot.docs.reduce<ListItem[]>((acc, curr) => {
            const data = curr.data();

            const category: ListItem = {
              type: 'sectionHeader',
              value: data.name,
            };

            const screens = data.screens.map<ListItem>((screen) => ({
              type: 'row',
              value: screen,
            }));

            return acc.concat([category, ...screens]);
          }, []),
        );
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <VStack flex={1} alignItems="center" pb="6" safeArea>
      <Box flex={1} alignSelf="stretch">
        <FlashList
          renderItem={({ item }) => {
            if (item.type === 'sectionHeader') {
              return (
                <Text
                  fontSize="lg"
                  fontWeight="medium"
                  mx="4"
                  mt="4"
                  color="primary.500"
                >
                  {item.value}
                </Text>
              );
            }

            return (
              <Text mx="4" mb="2">
                {item.value}
              </Text>
            );
          }}
          data={data}
          stickyHeaderIndices={stickyHeaderIndices}
          getItemType={(item) => item.type}
          estimatedItemSize={20}
        />
      </Box>

      <Actionsheet
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        size="full"
      >
        <KeyboardAvoidingView behavior="padding" width="full">
          <Actionsheet.Content>
            <AddScreenModal onClose={() => setAddModalOpen(false)} />
          </Actionsheet.Content>
        </KeyboardAvoidingView>
      </Actionsheet>

      <IconButton
        onPress={() => setAddModalOpen(true)}
        icon={<Icon as={Feather} name="plus" size="xl" color="white" />}
        size="16"
        backgroundColor="primary.500"
        rounded="full"
        shadow="5"
      />
    </VStack>
  );
};

export default HomeScreen;
