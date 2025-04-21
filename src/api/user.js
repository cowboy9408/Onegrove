import { useAuthStore } from "@/store/authStore";
import api from "../lib/apiClient";
import Cookies from "js-cookie";

export const getUserInfo = async (username, password) => {
  const res = await api.post(import.meta.env.VITE_API_BASE_URL + "/api/v1/auth/login", {
    username: username,
    password: password
  }, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
};

export const getRefreshAccessToken = async () => {
  const res = await api.post(import.meta.env.VITE_API_BASE_URL + "/api/v1/auth/refresh");
  const newAccessToken = res.data.accessToken;

  const setAccessToken = useAuthStore.getState().setAccessToken;
  setAccessToken(newAccessToken);

  return newAccessToken;
}