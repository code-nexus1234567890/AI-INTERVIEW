"use client";
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useEffect, useState } from 'react';

function Provider({ children }: any) {
  const { user } = useUser();
  const createUser = useMutation(api.users.CreateNewUser);
  const [userDetail, setUserDetail] = useState<any>();

  useEffect(() => {
    async function handleUserCreation() { 
      if (user && user.primaryEmailAddress?.emailAddress) {
        const newUser = await createUser({ 
          email: user.primaryEmailAddress.emailAddress,
          name: user.fullName ?? "",
          imageUrl: user.imageUrl ?? "",
        });
        setUserDetail(newUser); 
      }
    }
    handleUserCreation();
  }, [user]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;

export const useUserDetailContext = () => {
  return React.useContext(UserDetailContext);
};
