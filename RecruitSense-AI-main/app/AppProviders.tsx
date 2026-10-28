"use client";

import React, { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthFallbackProvider, isRealClerkKey } from "@/lib/authHelper";
import { Toaster } from "sonner";

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
        <Toaster richColors position="top-right" />
      </ClerkProvider>
    );
  }

  return (
    <AuthFallbackProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
      <Toaster richColors position="top-right" />
    </AuthFallbackProvider>
  );
}

