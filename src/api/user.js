import api from "../lib/apiClient";

export const getUserInfo = async (username, password) => {
  const res = await api.post(
    import.meta.env.VITE_API_BASE_URL + "/api/v1/auth/login",
    {
      username: username,
      password: password,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return res.data;
};
