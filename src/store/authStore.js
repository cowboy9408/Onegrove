import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const accessToken = "accessToken";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      permission: null,
      setAccessToken: (token) => {
        if (!token) return;

        set({ accessToken: token, permission: "Admin" });

        Cookies.set(accessToken, token, {
          expires: new Date(new Date().getTime() + 15 * 60 * 1000),
          secure: import.meta.env.MODE === "production",
          sameSite: "strict",
        });
      },
      removeAccessToken: () => {
        set({ accessToken: null, permission: null });

        Cookies.remove(accessToken, {
          sameSite: "strict",
        });
      },
      hasPermission: (requiredPermission) => {
        const { permission } = get();
        if (!permission || !requiredPermission) return false;
        return requiredPermission.includes(permission);
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
