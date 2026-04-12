"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { setAuthUser, clearAuthUser } from "@/store/authSlice";
import { store } from "@/store/store";
import { useAppDispatch } from "@/hooks/useAppDispatch";

function AuthStateBridge() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (session?.user) {
      dispatch(
        setAuthUser({
          name: session.user.name ?? "",
          role: session.user.role,
        }),
      );
    } else {
      dispatch(clearAuthUser());
    }
  }, [dispatch, session]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthStateBridge />
          {children}
        </QueryClientProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
