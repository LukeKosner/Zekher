"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode } from "react";

// Module-level singleton — persists across page navigations
let convexClient: ConvexReactClient | null = null;

function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
      skipConvexDeploymentUrlCheck: true,
    });
  }
  return convexClient;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = getConvexClient();

  return (
    <ConvexAuthProvider client={client}>
      {children}
    </ConvexAuthProvider>
  );
}
