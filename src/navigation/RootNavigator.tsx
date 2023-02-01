import { FC } from 'react';

import useSession from '../hooks/useSession';
import AuthStack from './AuthStack';
import DashboardStack from './DashboardStack';

const RootNavigator: FC = () => {
  const { user } = useSession();
  return user == null ? <AuthStack /> : <DashboardStack />;
};

export default RootNavigator;
