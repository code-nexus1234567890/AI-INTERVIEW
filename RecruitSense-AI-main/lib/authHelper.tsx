"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface MockUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role?: string;
  title?: string;
  imageUrl: string;
  primaryEmailAddress: {
    emailAddress: string;
  };
}

export const PRESET_USERS: MockUser[] = [
  {
    id: "user_ayush_candidate",
    fullName: "Ayush Sharma",
    firstName: "Ayush",
    lastName: "Sharma",
    role: "Full Stack Engineer",
    title: "Senior Full Stack Candidate",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    primaryEmailAddress: {
      emailAddress: "ayush@recruitsense.ai",
    },
  },
  {
    id: "user_sarah_candidate",
    fullName: "Sarah Chen",
    firstName: "Sarah",
    lastName: "Chen",
    role: "AI / ML Solutions Engineer",
    title: "AI Specialist Candidate",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    primaryEmailAddress: {
      emailAddress: "sarah.chen@recruitsense.ai",
    },
  },
  {
    id: "user_marcus_candidate",
    fullName: "Marcus Rodriguez",
    firstName: "Marcus",
    lastName: "Rodriguez",
    role: "Cloud & DevOps Architect",
    title: "Infrastructure Candidate",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    primaryEmailAddress: {
      emailAddress: "marcus.rodriguez@recruitsense.ai",
    },
  },
  {
    id: "user_priya_candidate",
    fullName: "Priya Patel",
    firstName: "Priya",
    lastName: "Patel",
    role: "Technical Product Manager",
    title: "Product Lead Candidate",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    primaryEmailAddress: {
      emailAddress: "priya.patel@recruitsense.ai",
    },
  },
];

export const DEFAULT_MOCK_USER: MockUser = PRESET_USERS[0];

export function isRealClerkKey(key?: string | null): boolean {
  if (!key) return false;
  if (key.includes("example.com")) return false;
  if (key === "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k") return false;
  if (key.includes("placeholder")) return false;
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
}

interface AuthContextType {
  user: MockUser | null;
  users: MockUser[];
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => void;
  setUser: (user: MockUser) => void;
  switchUser: (userId: string) => void;
  createUser: (params: { fullName: string; role?: string; email?: string; imageUrl?: string }) => MockUser;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_MOCK_USER,
  users: PRESET_USERS,
  isLoaded: true,
  isSignedIn: true,
  signOut: () => {},
  setUser: () => {},
  switchUser: () => {},
  createUser: () => DEFAULT_MOCK_USER,
  deleteUser: () => {},
});

const AUTH_STORAGE_KEY = "recruitsense_auth_user";
const USERS_STORAGE_KEY = "recruitsense_all_users";
const LOGGED_OUT_KEY = "recruitsense_auth_logged_out";

export function AuthFallbackProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<MockUser[]>(PRESET_USERS);
  const [user, setUserState] = useState<MockUser | null>(DEFAULT_MOCK_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state from storage
  const syncFromStorage = useCallback(() => {
    try {
      // 1. Load users list
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      let loadedUsers: MockUser[] = PRESET_USERS;
      if (storedUsersRaw) {
        const parsed = JSON.parse(storedUsersRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge presets to ensure all presets always exist
          const existingIds = new Set(parsed.map((u: MockUser) => u.id));
          const missingPresets = PRESET_USERS.filter((p) => !existingIds.has(p.id));
          loadedUsers = [...parsed, ...missingPresets];
        }
      }
      setUsers(loadedUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(loadedUsers));

      // 2. Check if logged out explicitly
      const isExplicitlyLoggedOut = localStorage.getItem(LOGGED_OUT_KEY) === "true";
      if (isExplicitlyLoggedOut) {
        setUserState(null);
        setIsLoaded(true);
        return;
      }

      // 3. Load active user
      const storedUserRaw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUserRaw) {
        const parsedUser = JSON.parse(storedUserRaw);
        // Find fresh copy from loaded users if available
        const matched = loadedUsers.find((u) => u.id === parsedUser?.id);
        setUserState(matched || parsedUser);
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_USER));
        setUserState(DEFAULT_MOCK_USER);
      }
    } catch {
      setUserState(DEFAULT_MOCK_USER);
      setUsers(PRESET_USERS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleAuthChange = () => {
      syncFromStorage();
    };

    window.addEventListener("recruitsense_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("recruitsense_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [syncFromStorage]);

  const switchUser = useCallback(
    (userId: string) => {
      const target = users.find((u) => u.id === userId) || PRESET_USERS.find((u) => u.id === userId);
      if (target) {
        setUserState(target);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(target));
          localStorage.removeItem(LOGGED_OUT_KEY);
          window.dispatchEvent(new Event("recruitsense_auth_change"));
        } catch (e) {
          console.warn("Failed saving switched user:", e);
        }
      }
    },
    [users]
  );

  const setUser = useCallback((newUser: MockUser) => {
    setUserState(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.removeItem(LOGGED_OUT_KEY);

      // Also ensure newUser is in users list
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === newUser.id);
        const updated = exists ? prev.map((u) => (u.id === newUser.id ? newUser : u)) : [newUser, ...prev];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      window.dispatchEvent(new Event("recruitsense_auth_change"));
    } catch (e) {
      console.warn("Failed updating user:", e);
    }
  }, []);

  const createUser = useCallback(
    (params: { fullName: string; role?: string; email?: string; imageUrl?: string }): MockUser => {
      const cleanName = params.fullName.trim() || "New Candidate";
      const parts = cleanName.split(" ");
      const firstName = parts[0] || "Candidate";
      const lastName = parts.slice(1).join(" ") || "";
      const email =
        params.email?.trim() || `${cleanName.toLowerCase().replace(/\s+/g, ".")}@recruitsense.ai`;
      const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const role = params.role?.trim() || "Software Engineer Candidate";
      const imageUrl =
        params.imageUrl?.trim() ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80`;

      const newUser: MockUser = {
        id,
        fullName: cleanName,
        firstName,
        lastName,
        role,
        title: role,
        imageUrl,
        primaryEmailAddress: {
          emailAddress: email,
        },
      };

      setUsers((prev) => {
        const updated = [newUser, ...prev];
        try {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed saving new users list:", e);
        }
        return updated;
      });

      setUserState(newUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        localStorage.removeItem(LOGGED_OUT_KEY);
        window.dispatchEvent(new Event("recruitsense_auth_change"));
      } catch (e) {
        console.warn("Failed setting active new user:", e);
      }

      return newUser;
    },
    []
  );

  const deleteUser = useCallback(
    (userId: string) => {
      // Do not allow deleting presets
      if (PRESET_USERS.some((p) => p.id === userId)) {
        return;
      }
      setUsers((prev) => {
        const updated = prev.filter((u) => u.id !== userId);
        try {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed deleting user:", e);
        }
        return updated;
      });

      if (user?.id === userId) {
        switchUser(DEFAULT_MOCK_USER.id);
      }
    },
    [user, switchUser]
  );

  const signOut = useCallback(() => {
    setUserState(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.setItem(LOGGED_OUT_KEY, "true");
      window.dispatchEvent(new Event("recruitsense_auth_change"));
    } catch (e) {
      console.warn("Failed signing out:", e);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isLoaded,
        isSignedIn: Boolean(user),
        signOut,
        setUser,
        switchUser,
        createUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthFallback() {
  return useContext(AuthContext);
}
