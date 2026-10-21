"use client";

import React, { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthFallbackProvider, isRealClerkKey } from "@/lib/authHelper";

interface AppProvidersProps {
  children: ReactNode;
  clerkKey: string;
}

export function AppProviders({ children, clerkKey }: AppProvidersProps) {
  const isReal = isRealClerkKey(clerkKey);

  if (isReal) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </ClerkProvider>
    );
  }

  return (
    <AuthFallbackProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </AuthFallbackProvider>
  );
}
