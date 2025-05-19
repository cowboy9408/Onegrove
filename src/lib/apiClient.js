import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useLoadingStore } from "@/store/loadingStore";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
});

// 요청 인터셉터: accessToken + 로딩 시작
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("accessToken", token);
    }

    // 로딩 시작
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

// 응답 인터셉터: 정상 응답 또는 토큰 재발급 후 재요청
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

    // 토큰 만료로 인한 401, 그리고 재시도 안 된 요청만 처리
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(
          `${baseURL}/api/v1/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = res.data.accessToken;
        const { setAccessToken } = useAuthStore.getState();
        setAccessToken(newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("토큰 리프레시 실패:", refreshError);

        // 여기서 로그인 강제 이동 제거
        // localStorage.removeItem("accessToken");
        // localStorage.removeItem("refreshToken");

        // 토큰 만료 에러를 호출 측에서 판단하게 처리
        refreshError.isAuthFailed = true;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
