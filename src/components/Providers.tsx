"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { setAuthUser, clearAuthUser } from "@/redux/authSlice";
import { useAppDispatch } from "@/redux/hooks";

function AuthLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cookies = document.cookie
      .split(";")
      .reduce<Record<string, string>>((acc, cookie) => {
        const [name, ...rest] = cookie.trim().split("=");
        acc[name] = decodeURIComponent(rest.join("="));
        return acc;
      }, {});

    const userCookie = cookies.skillUser;
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        dispatch(setAuthUser(user));
        return;
      } catch {
        // ignore invalid cookie
      }
    }

    dispatch(clearAuthUser());
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthLoader />
      {children}
    </Provider>
  );
}
