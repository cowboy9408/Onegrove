import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { PanelLeftOpenIcon } from "@/components/ui/panel-left-open";
import useSidebar from "@/hooks/useSidebar";
import { findMatchingRoute } from "@/routes";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getRefreshAccessToken } from "@/api/user";

function ContentArea() {
  const { isExpanded } = useSidebar();

  return (
    <div
      className={`flex min-h-screen flex-1 flex-col space-y-6 overflow-auto p-6 pl-4 ${isExpanded ? "md:pl-82" : "md:pl-35"}`}
    >
      <Header />
      <main
        className={`mb-0 max-w-screen rounded-xl transition-all duration-300 ${
          isExpanded
            ? "md:max-w-[calc(100vw-22rem)]"
            : "md:max-w-[calc(100vw-7rem)]"
        }`}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function AuthLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const permission = useAuthStore((state) => state.permission);

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const removeAccessToken = useAuthStore((state) => state.removeAccessToken);

  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { isExpanded, toggleSidebar } = useSidebar();
  const { pathname } = useLocation();

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("ACCESS_TOKEN");
      const route = findMatchingRoute(pathname);

      if (!token) {
        try {
          const refreshed = await getRefreshAccessToken();
          setAccessToken(refreshed.accessToken, refreshed.permission);
        } catch (err) {
          console.error("토큰 리프레시 실패:", err);
          removeAccessToken();
          navigate("/login");
          return;
        }
      }

      if (!accessToken) {
        navigate("/login");
        return;
      }

      if (route?.permissions && !route.permissions.includes(permission)) {
        navigate("/403");
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [pathname, accessToken, permission, navigate]);

  if (!isAuthorized) return null;

  return (
    <div className="flex max-w-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <Sidebar />

      {isMobile && !isExpanded && (
        <div
          className="fixed top-15 left-0 z-[100] flex h-10 w-10 cursor-pointer items-center justify-center rounded-tr-md rounded-br-md bg-white p-2 opacity-50 dark:bg-black"
          onClick={toggleSidebar}
        >
          <PanelLeftOpenIcon size={20} />
        </div>
      )}

      <ContentArea />
    </div>
  );
}