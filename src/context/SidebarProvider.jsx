import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { SidebarContext } from "./SidebarContext";

export function SidebarProvider({ children }) {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{ isExpanded, setIsExpanded, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
