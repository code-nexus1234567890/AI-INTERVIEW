"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import Provider from "./Provider";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-red-400">
        <div className="max-w-xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 shadow-lg shadow-red-950/20">
          <p className="text-xl font-semibold">Missing Convex configuration</p>
          <p className="mt-3 text-sm text-slate-200">
            Add NEXT_PUBLIC_CONVEX_URL to your .env.local file, then restart the app.
          </p>
        </div>
      </div>
    );
  }

  const convex = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (
    <ConvexProvider client={convex}>
      <Provider>{children}</Provider>
    </ConvexProvider>
  );
}