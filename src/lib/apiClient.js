import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useLoadingStore } from "@/store/loadingStore";

// 기본 axios 인스턴스 생성
const api = axios.create({
  withCredentials: true,
});

// 요청 인터셉터: accessToken + 로딩 시작
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
          `/api/v1/auth/refresh`,
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

        // ✅ 네트워크 오류 또는 서버가 죽은 경우: 로그인 페이지로 리다이렉트
        if (
          refreshError.code === "ERR_NETWORK" ||
          refreshError.message.includes("Network Error") ||
          refreshError.message.includes("ERR_CONNECTION_REFUSED")
        ) {
          window.location.href = "/login";
          return; // 이후 요청 중단
        }

        refreshError.isAuthFailed = true;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;