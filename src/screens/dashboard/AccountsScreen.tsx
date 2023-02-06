import { FC, useEffect, useState } from 'react';
import onAdd from '@/events/onAdd';
import useUser from '@/hooks/useUser';
import { collections } from '@/lib/firebase';
import AddUserModal from '@/modals/AddUserModal';
import User from '@/types/user';
import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { onSnapshot } from 'firebase/firestore';
import {
  Actionsheet,
  Box,
  HStack,
  Icon,
  KeyboardAvoidingView,
  Text,
  VStack,
} from 'native-base';

const AccountsScreen: FC = () => {
  const user = useUser();

  const [data, setData] = useState<User[]>([]);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collections.users, (snapshot) => {
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = onAdd.subscribe('Accounts', () => {
      setAddModalOpen(true);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <VStack flex={1} alignItems="center" pb="6" safeArea>
      <Text
        fontSize="2xl"
        color="primary.500"
        fontWeight="semibold"
        textAlign="center"
        mt="4"
      >
        Point Service Center
      </Text>

      <Box flex={1} alignSelf="stretch" mt="4">
        <FlashList<User>
          ListEmptyComponent={
            <VStack justifyContent="center" alignItems="center" mt="16">
              <Icon
                as={Feather}
                name="alert-triangle"
                color="primary.500"
                size="4xl"
              />

              <Text fontSize="lg" color="primary.500" mt="1">
                Tidak dapat menemukan data!
              </Text>
            </VStack>
          }
          renderItem={({ item }) => (
            <VStack
              mx="4"
              mb="3"
              pl="5"
              pr="4"
              py="3"
              rounded="md"
              borderWidth="1"
              backgroundColor="white"
              borderColor={item.id === user?.id ? 'primary.500' : 'gray.200'}
            >
              <Text fontSize="lg" fontWeight="medium">
                {item.username}
              </Text>

              <HStack justifyContent="space-between">
                <Text
                  fontSize="md"
                  color="blueGray.400"
                  textTransform="capitalize"
                  mr="2"
                >
                  {item.role}
                </Text>

                <Text
                  fontSize="md"
                  color="blueGray.400"
                  flex={1}
                  textAlign="right"
                >
                  {item.email}
                </Text>
              </HStack>
            </VStack>
          )}
          data={data}
          estimatedItemSize={88}
        />
      </Box>

      <Actionsheet
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        size="full"
      >
        <KeyboardAvoidingView behavior="padding" width="full">
          <Actionsheet.Content>
            <AddUserModal onClose={() => setAddModalOpen(false)} />
          </Actionsheet.Content>
        </KeyboardAvoidingView>
      </Actionsheet>
    </VStack>
  );
};

export default AccountsScreen;
