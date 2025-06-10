import { findRouteMeta } from "@/routes";
import { useAuthStore } from "@/store/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import { LogoutIcon } from "../ui/logout";
import DarkModeToggle from "./DarkModeToggle";
import { BadgeAlertIcon } from "../ui/badge-alert";
import Tooltip from "../common/Tooltip";

export default function Header() {
  const removeAccessToken = useAuthStore((state) => state.removeAccessToken);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const meta = findRouteMeta(pathname);

  const handleLogout = () => {
    removeAccessToken();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="ml-4 flex flex-1 flex-col justify-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {meta?.title}
        </h1>
      </div>

      <div className="flex items-center gap-4 px-6 py-4">
        {/* <DarkModeToggle /> */}

        <Tooltip label={meta?.description || meta?.title}>
          <BadgeAlertIcon size={20} />
        </Tooltip>

        <button onClick={handleLogout}>
          <LogoutIcon size={20} />
        </button>
      </div>
    </header>
  );
}
