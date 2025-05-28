import useSidebar from "@/hooks/useSidebar";
import { extractSidebarItems, findMatchingRoute, routeMeta } from "@/routes";
import { useAuthStore } from "@/store/authStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DropdownMenu from "../dropdown/DropdownMenu";
import { LogoutIcon } from "../ui/logout";
import { PanelLeftCloseIcon } from "../ui/panel-left-close";
import { PanelLeftOpenIcon } from "../ui/panel-left-open";
import Menu from "./Menu";

export default function Sidebar() {
  const { pathname } = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [openMenus, setOpenMenus] = useState({});
  const removeAccessToken = useAuthStore((state) => state.removeAccessToken);
  const permission = useAuthStore((state) => state.permission);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const { isExpanded, setIsExpanded, toggleSidebar } = useSidebar();
  const name = useAuthStore((state) => state.name);

  const sidebarItems = useMemo(
    () => extractSidebarItems(routeMeta[0].children, permission),
    [permission]
  );
  const groupPath = findMatchingRoute(pathname).group || pathname;

  const findMenuByPath = useCallback((path, items) => {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.children) {
        const found = findMenuByPath(path, item.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const collectAncestorPaths = useCallback(
    (target, items = sidebarItems, parents = []) => {
      for (const item of items) {
        if (item.path === target.path) {
          return parents.map((p) => p.path);
        }

        if (item.children) {
          const found = collectAncestorPaths(target, item.children, [
            ...parents,
            item,
          ]);
          if (found) return found;
        }
      }
      return [];
    },
    [sidebarItems]
  );

  useEffect(() => {
    const matchedItem = findMenuByPath(groupPath, sidebarItems);
    if (matchedItem) {
      const ancestorPaths = collectAncestorPaths(matchedItem, sidebarItems);
      setOpenMenus((prev) => {
        const newState = { ...prev };
        [...ancestorPaths, matchedItem.path].forEach((p) => {
          newState[p] = true;
        });
        return newState;
      });
    }
  }, [groupPath, findMenuByPath, collectAncestorPaths, sidebarItems]);

  useEffect(() => {
    if (!isExpanded || !isMobile || !setIsExpanded) return;

    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, setIsExpanded, isMobile]);

  const handleLogout = () => {
    removeAccessToken();
    navigate("/login");
  };

  const toggleMenu = (path, item) => {
    setOpenMenus((prev) => {
      const nextState = { ...prev };
      const isCurrentlyOpen = prev[path];

      if (isCurrentlyOpen && item.children) {
        const descendants = collectDescendantPaths(item);
        descendants.forEach((descPath) => {
          delete nextState[descPath];
        });
        nextState[path] = false;
        return nextState;
      }

      const ancestors = collectAncestorPaths(item);
      console.log(ancestors);
      [...ancestors, path].forEach((p) => {
        nextState[p] = true;
      });

      return nextState;
    });
  };

  const collectDescendantPaths = (item) => {
    let paths = [];
    if (item.children) {
      for (const child of item.children) {
        paths.push(child.path);
        paths = [...paths, ...collectDescendantPaths(child)];
      }
    }
    return paths;
  };

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed z-50 m-6 mr-2 flex h-241 max-h-[calc(100vh-6rem)] !flex-none flex-col justify-between overflow-auto rounded-xl border-2 border-gray-200 bg-white px-2 pt-0 pb-2 transition-all duration-300
        md:max-h-[calc(100vh-3rem)] md:px-3 md:pb-4 dark:border-gray-700 dark:bg-gray-800 ${isExpanded ? "w-70 min-w-70" : "w-17 min-w-17 md:w-25 md:min-w-25"} ${
        isMobile
          ? `top-6 transition-[left] duration-300 ${isExpanded ? "left-0" : "-left-72"}`
          : ""
      }`}
    >
      <div>
        <div className="flex items-center justify-between border-b border-gray-200 px-2 py-3 text-xl font-bold md:py-4 dark:border-gray-700">
          {isExpanded && (
            <Link
              to={"/"}
              className="overflow-hidden leading-tight whitespace-nowrap"
            >
              ONE GROVE
            </Link>
          )}

          <div
            className="hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-2 transition-colors duration-200 select-none"
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <PanelLeftCloseIcon size={20} />
            ) : (
              <PanelLeftOpenIcon size={20} />
            )}
          </div>
        </div>
        <nav className="space-y-1 pt-4">
          {sidebarItems.map((item) => (
            <Menu
              key={item.uuid}
              item={item}
              depth={0}
              pathname={pathname}
              groupPath={groupPath}
              isExpanded={isExpanded}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              toggleSidebar={toggleSidebar}
            />
          ))}
        </nav>
      </div>

      <div
        className={`flex justify-center rounded-md border-t border-gray-200 pt-2 align-middle dark:border-gray-700 ${isExpanded ? "md:border-2 md:p-2" : ""}`}
      >
        {isExpanded ? (
          <div className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-800 dark:text-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {name && name.substring(0, 1)}
            </div>
            <span className="truncate">{name}님</span>
            <div
              className="ml-auto hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogoutIcon size={18} />
            </div>
          </div>
        ) : (
          <DropdownMenu
            align="left"
            trigger={
              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                  {name && name.substring(0, 1)}
                </div>
                {isExpanded && <span className="truncate">{name}님</span>}
              </button>
            }
          >
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-black"
            >
              <LogoutIcon size={16} />
              <span>로그아웃</span>
            </button>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
