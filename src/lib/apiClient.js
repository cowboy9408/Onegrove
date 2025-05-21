import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useLoadingStore } from "@/store/loadingStore";

// 환경변수에서 baseURL 불러오기
const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("accessToken", token);
    }

    const { startLoading } = useLoadingStore.getState();
    startLoading();

    return config;
  },
  (error) => {
    const { endLoading } = useLoadingStore.getState();
    endLoading();
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    const { endLoading } = useLoadingStore.getState();
    endLoading();
    return response;
  },
  async (error) => {
    const { endLoading } = useLoadingStore.getState();
    endLoading();

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
<<<<<<< HEAD
          `${baseURL}/api/v1/auth/refresh`,
=======
          `/api/v1/auth/refresh`,
>>>>>>> f95e7a6 (리프레시토큰 만료되었을 경우 login 페이지로 리다이렉트)
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        const { setAccessToken } = useAuthStore.getState();
        setAccessToken(newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("토큰 리프레시 실패:", refreshError);

        localStorage.removeItem("accessToken");

<<<<<<< HEAD
        // 401 오류 또는 네트워크 오류일 경우 로그인 페이지로 이동
        const isNetworkError =
          refreshError.code === "ERR_NETWORK" ||
          refreshError.message.includes("Network Error") ||
          refreshError.message.includes("ERR_CONNECTION_REFUSED");

        const isUnauthorized =
          refreshError.response?.status === 401;

        if (isNetworkError || isUnauthorized) {
          window.location.href = "/login";
          return;
=======
        // ✅ 네트워크 오류 또는 서버가 죽은 경우: 로그인 페이지로 리다이렉트
        if (
          refreshError.code === "ERR_NETWORK" ||
          refreshError.message.includes("Network Error") ||
          refreshError.message.includes("ERR_CONNECTION_REFUSED")
        ) {
          window.location.href = "/login";
          return; // 이후 요청 중단
>>>>>>> f95e7a6 (리프레시토큰 만료되었을 경우 login 페이지로 리다이렉트)
        }

        refreshError.isAuthFailed = true;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;