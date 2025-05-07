import api from "../lib/apiClient";

export const getUserInfo = async () => {
  const res = await api.get("/user/me");

  return res.data;
};
