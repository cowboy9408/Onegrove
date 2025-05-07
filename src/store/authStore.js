import Cookies from "js-cookie";
// 임시 주석처리
// import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const accessToken = "ACCESS_TOKEN";

// 임시 사용
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

// 임시 주석처리
// export const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       accessToken: null,
//       permission: null,
//       name: null,
//       setAccessToken: (token) => {
//         if (!token) return;
//
//         const decode = jwtDecode(token);
//         const role = decode.roles[0];
//         set({ accessToken: token, permission: role });
//
//         Cookies.set(accessToken, token, {
//           expires: new Date(new Date().getTime() + 15 * 60 * 1000),
//           // secure: import.meta.env.MODE === "production",
//           secure: import.meta.env.MODE === "development",
//           sameSite: "strict",
//         });
//       },
//       removeAccessToken: () => {
//         set({ accessToken: null, permission: null });
//
//         Cookies.remove(accessToken, {
//           sameSite: "strict",
//         });
//       },
//       hasPermission: (requiredPermission) => {
//         const { permission } = get();
//         if (!permission || !requiredPermission) return false;
//         return requiredPermission.includes(permission);
//       },
//       setName: (name) => {
//         set({ name });
//       },
//     }),
//     {
//       name: "auth-storage",
//       storage: createJSONStorage(() => localStorage),
//     }
//   )
// );
