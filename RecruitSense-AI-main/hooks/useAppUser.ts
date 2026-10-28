"use client";

import { useUser as useClerkUser, useClerk } from "@clerk/nextjs";
import { isRealClerkKey, useAuthFallback } from "@/lib/authHelper";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasRealClerk = isRealClerkKey(clerkKey);

export function useAppUser() {
  const fallback = useAuthFallback();

  if (!hasRealClerk) {
    return {
      user: fallback.user,
      users: fallback.users,
      isLoaded: fallback.isLoaded,
      isSignedIn: fallback.isSignedIn,
      signOut: fallback.signOut,
      setUser: fallback.setUser,
      switchUser: fallback.switchUser,
      createUser: fallback.createUser,
      deleteUser: fallback.deleteUser,
      isClerk: false,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerk = useClerkUser();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerkAuth = useClerk();

  return {
    user: clerk.user,
    users: fallback.users,
    isLoaded: clerk.isLoaded,
    isSignedIn: clerk.isSignedIn,
    signOut: () => clerkAuth.signOut(),
    setUser: fallback.setUser,
    switchUser: fallback.switchUser,
    createUser: fallback.createUser,
    deleteUser: fallback.deleteUser,
    isClerk: true,
  };
}

