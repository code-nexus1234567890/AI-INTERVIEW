"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface MockUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  primaryEmailAddress: {
    emailAddress: string;
  };
}

export const DEFAULT_MOCK_USER: MockUser = {
  id: "user_ayush_candidate",
  fullName: "Ayush Sharma",
  firstName: "Ayush",
  lastName: "Sharma",
  imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  primaryEmailAddress: {
    emailAddress: "ayush@recruitsense.ai",
  },
};

export function isRealClerkKey(key?: string | null): boolean {
  if (!key) return false;
  if (key.includes("example.com")) return false;
  if (key === "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k") return false;
  if (key.includes("placeholder")) return false;
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
}

interface AuthContextType {
  user: MockUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => void;
  setUser: (user: MockUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_MOCK_USER,
  isLoaded: true,
  isSignedIn: true,
  signOut: () => {},
  setUser: () => {},
});

const AUTH_STORAGE_KEY = "recruitsense_auth_user";

export function AuthFallbackProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<MockUser | null>(DEFAULT_MOCK_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUserState(JSON.parse(stored));
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_USER));
        setUserState(DEFAULT_MOCK_USER);
      }
    } catch {
      setUserState(DEFAULT_MOCK_USER);
    }
    setIsLoaded(true);
  }, []);

  const setUser = (newUser: MockUser) => {
    setUserState(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const signOut = () => {
    setUserState(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: Boolean(user),
        signOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthFallback() {
  return useContext(AuthContext);
}
