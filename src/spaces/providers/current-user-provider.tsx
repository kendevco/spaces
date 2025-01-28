'use client';

import { useEffect } from 'react';
import { useCurrentProfile } from '@/spaces/hooks/use-current-profile';
import { User } from '@/payload-types';

interface CurrentUserProviderProps {
  user: User | null;
  children: React.ReactNode;
}

export const CurrentUserProvider = ({
  user,
  children
}: CurrentUserProviderProps) => {
  const { setUser } = useCurrentProfile();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return <>{children}</>;
};
