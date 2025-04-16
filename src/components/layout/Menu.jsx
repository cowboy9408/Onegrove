import { useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "../ui/chevron-down";
import { ChevronUpIcon } from "../ui/chevron-up";

export default function Menu({
  item,
  depth,
  pathname,
  groupPath,
  isExpanded,
  openMenus,
  toggleMenu,
  toggleSidebar,
}) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isOpen = openMenus[item.path];
  const navigate = useNavigate();
  const isActive = groupPath === item.path || pathname === item.path;

  const depthStyle = {
    0: "text-base font-semibold text-black dark:text-white",
    1: "text-sm font-medium text-gray-800 dark:text-gray-100",
    2: "text-sm font-normal text-gray-600 dark:text-gray-300",
  };

  const bgHover = {
    0: "hover:bg-gray-200 dark:hover:bg-gray-700",
    1: "hover:bg-gray-100 dark:hover:bg-gray-800",
    2: "hover:bg-gray-50 dark:hover:bg-gray-900",
  };

  return (
    <div key={item.path}>
      <div
        onClick={() => {
          if (hasChildren) {
            if (!isExpanded) {
              toggleSidebar();
            }
            toggleMenu(item.path, item);
          } else if (item.path !== "#") {
            navigate(item.path);
          }
        }}
        className={`flex cursor-pointer items-center rounded-md px-2 py-2 transition-colors duration-200 ${
          isActive
            ? "bg-black text-white dark:bg-white dark:text-black"
            : `${depthStyle[depth]} ${bgHover[depth]}`
        }`}
        style={{ marginLeft: isExpanded ? depth * 16 : 0 }}
      >
        {depth === 0 && item.icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
            {item.icon}
          </div>
        )}
        <span
          className={`ml-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          } flex w-full items-center justify-between`}
        >
          {item.label}

          {hasChildren && isExpanded && !isOpen && (
            <ChevronDownIcon size={16} className="hover:bg-transparent" />
          )}
          {hasChildren && isExpanded && isOpen && (
            <ChevronUpIcon size={16} className="hover:bg-transparent" />
          )}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
            isOpen ? "mt-1 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1">
            {item.children.map((child) => (
              <Menu
                key={child.uuid}
                item={child}
                depth={depth + 1}
                pathname={pathname}
                groupPath={groupPath}
                isExpanded={isExpanded}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
                toggleSidebar={toggleSidebar}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
