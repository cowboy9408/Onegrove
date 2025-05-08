import api from "../lib/apiClient";

export const getUserInfo = async () => {
  const res = await api.get("/user/me");

  return res.data;
};
// 임시 주석처리
// export const getUserInfo = async (username, password) => {
//   const res = await api.post(import.meta.env.VITE_API_BASE_URL + "/api/v1/auth/login", {
//     username: username,
//     password: password
//   }, {
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//   });
//
//   return res.data;
// };
//
// export const getRefreshAccessToken = async () => {
//   const res = await api.post(import.meta.env.VITE_API_BASE_URL + "/api/v1/auth/refresh");
//   const newAccessToken = res.data.accessToken;
//
//   const setAccessToken = useAuthStore.getState().setAccessToken;
//   setAccessToken(newAccessToken);
//
//   return newAccessToken;
// }
