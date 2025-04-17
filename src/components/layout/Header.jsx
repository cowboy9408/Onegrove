import { findMatchingRoute } from "@/routes";
import { useAuthStore } from "@/store/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import Tooltip from "../common/Tooltip";
import { BadgeAlertIcon } from "../ui/badge-alert";
import { LogoutIcon } from "../ui/logout";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  const removeAccessToken = useAuthStore((state) => state.removeAccessToken);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const meta = findMatchingRoute(pathname);

  const handleLogout = () => {
    removeAccessToken();
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
        <DarkModeToggle />

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
