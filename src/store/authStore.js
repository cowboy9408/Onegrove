import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const accessToken = "ACCESS_TOKEN";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      permission: null,
      name: null,
      companyId: null,
      setAccessToken: (token) => {
        if (!token) return;

        const decode = jwtDecode(token);
        const role = decode.roles[0];
        const companyId = decode.companyId || null;
        set({ accessToken: token, permission: role, companyId });

        Cookies.set(accessToken, token, {
          expires: new Date(new Date().getTime() + 15 * 60 * 1000),
          // secure: import.meta.env.MODE === "production",
          secure: import.meta.env.MODE === "development",
          sameSite: "strict",
        });
        localStorage.setItem("accessToken", token);
      },
      setRefreshToken: (token) => {
        if (!token) return;
        set({ refreshToken: token });
        localStorage.setItem("refreshToken", token);
      },
      removeAccessToken: () => {
        set({ accessToken: null, permission: null, companyId: null });

        Cookies.remove(accessToken, {
          sameSite: "strict",
        });
      },
      hasPermission: (requiredPermission) => {
        const { permission } = get();
        if (!permission || !requiredPermission) return false;
        return requiredPermission.includes(permission);
      },
      setName: (name) => {
        set({ name });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
