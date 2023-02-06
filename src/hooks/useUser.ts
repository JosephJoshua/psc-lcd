import { useEffect, useState } from 'react';
import { collections } from '@/lib/firebase';
import User from '@/types/user';
import { doc, onSnapshot } from 'firebase/firestore';

import useSession from './useSession';

const useUser = () => {
  const session = useSession();
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    if (session.user?.uid == null) return;

    const unsubscribe = onSnapshot(
      doc(collections.users, session?.user?.uid),
      (snapshot) => {
        const data = snapshot.data();
        if (data != null) setUser({ ...data, id: snapshot.id });
      },
    );

    return () => unsubscribe();
  }, [session.user?.uid]);

  return user;
};

export default useUser;
