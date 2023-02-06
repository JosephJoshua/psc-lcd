export type UserRole = 'admin' | 'employee';

type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'employee';
};

export default User;
