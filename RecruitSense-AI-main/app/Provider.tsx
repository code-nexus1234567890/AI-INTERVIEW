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
  const [userDetail, setUserDetail] = useState<any>({
    _id: "user_ayush_candidate",
    name: "Ayush Sharma",
    email: "ayush@recruitsense.ai",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  });

  useEffect(() => {
    if (user) {
      setUserDetail({
        _id: user.id || "user_ayush_candidate",
        name: user.fullName || "Ayush Sharma",
        email: user.primaryEmailAddress?.emailAddress || "ayush@recruitsense.ai",
        imageUrl: user.imageUrl || "",
      });
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
