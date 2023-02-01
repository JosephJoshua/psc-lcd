import { FC } from 'react';
import Button from '@/components/Button';
import useSession from '@/hooks/useSession';
import { auth } from '@/lib/firebase';
import { VBox } from '@/lib/styled/layout';
import { Text } from '@/lib/styled/text';
import { signOut } from 'firebase/auth';

const HomeScreen: FC = () => {
  const { user } = useSession();

  return (
    <VBox justify="center" items="center">
      <Text>Welcome {user?.email}</Text>
      <Button
        title="Keluar"
        variant="primary"
        onPress={() => signOut(auth)}
      ></Button>
    </VBox>
  );
};

export default HomeScreen;
