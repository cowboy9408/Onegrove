import { useAuthStore } from "@/store/authStore";
import api from "../lib/apiClient";

export const getUserInfo = async (username, password) => {
  const res = await api.post(
    "/api/v1/auth/login",
    {
      username: username,
      password: password,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      withCredentials: true,
    }
  );
  return res.data;
};

export const getRefreshAccessToken = async () => {
  const res = await api.post(
    "/api/v1/auth/refresh"
  );
  const newAccessToken = res.data.accessToken;
  const permission = res.data.permission;

  const setAccessToken = useAuthStore.getState().setAccessToken;
  setAccessToken(newAccessToken, permission);

  return { accessToken: newAccessToken, permission };
};
