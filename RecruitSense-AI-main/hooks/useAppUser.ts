"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { isRealClerkKey, useAuthFallback } from "@/lib/authHelper";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasRealClerk = isRealClerkKey(clerkKey);

export function useAppUser() {
  const fallback = useAuthFallback();

  if (!hasRealClerk) {
    return {
      user: fallback.user,
      isLoaded: fallback.isLoaded,
      isSignedIn: fallback.isSignedIn,
      signOut: fallback.signOut,
      setUser: fallback.setUser,
      isClerk: false,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerk = useClerkUser();
  return {
    user: clerk.user,
    isLoaded: clerk.isLoaded,
    isSignedIn: clerk.isSignedIn,
    signOut: () => {},
    setUser: () => {},
    isClerk: true,
  };
}
