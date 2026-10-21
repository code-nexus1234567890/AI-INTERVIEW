"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import Provider from "./Provider";

function isRealConvexUrl(url?: string): boolean {
  if (!url) return false;
  if (url.includes("placeholder")) return false;
  return url.startsWith("https://") && (url.includes(".convex.cloud") || url.includes(".convex.site"));
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const isReal = isRealConvexUrl(convexUrl);

  const convex = useMemo(() => {
    return isReal && convexUrl ? new ConvexReactClient(convexUrl) : null;
  }, [isReal, convexUrl]);

  if (!isReal || !convex) {
    // Graceful offline/local mode: renders children with full local persistence support
    return <Provider isConvexConnected={false}>{children}</Provider>;
  }

  return (
    <ConvexProvider client={convex}>
      <Provider isConvexConnected={true}>{children}</Provider>
    </ConvexProvider>
  );
}