"use client";

import { UserDetailContext } from "@/context/UserDetailContext";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import React, { useEffect, useState } from "react";
import { useAppUser } from "@/hooks/useAppUser";

export function ProviderWithConvex({ children }: { children: React.ReactNode }) {
  const { user } = useAppUser();
  const createUser = useMutation(api.users.CreateNewUser);
  const [userDetail, setUserDetail] = useState<any>();

  useEffect(() => {
    async function handleUserCreation() {
      if (user && user.primaryEmailAddress?.emailAddress) {
        try {
          const newUser = await createUser({
            email: user.primaryEmailAddress.emailAddress,
            name: user.fullName ?? "Candidate",
            imageUrl: user.imageUrl ?? "",
          });
          setUserDetail(newUser);
        } catch {
          setUserDetail({
            _id: user.id || "user_local_123",
            email: user.primaryEmailAddress.emailAddress,
            name: user.fullName ?? "Candidate",
            imageUrl: user.imageUrl ?? "",
          });
        }
      } else {
        setUserDetail(null);
      }
    }
    handleUserCreation();
  }, [user, createUser]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export function ProviderWithoutConvex({ children }: { children: React.ReactNode }) {
  const { user } = useAppUser();
  const [userDetail, setUserDetail] = useState<any>(
    user
      ? {
          _id: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
        }
      : null
  );

  useEffect(() => {
    if (user) {
      setUserDetail({
        _id: user.id,
        name: user.fullName || "Candidate",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl || "",
      });
    } else {
      setUserDetail(null);
    }
  }, [user]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

function Provider({ children, isConvexConnected = false }: { children: any; isConvexConnected?: boolean }) {
  if (isConvexConnected) {
    return <ProviderWithConvex>{children}</ProviderWithConvex>;
  }
  return <ProviderWithoutConvex>{children}</ProviderWithoutConvex>;
}

export default Provider;

export const useUserDetailContext = () => {
  return React.useContext(UserDetailContext);
};
