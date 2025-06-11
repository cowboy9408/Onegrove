import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

// export const ThemeProvider = ({ children }) => {
//   const getInitialTheme = () => {
//     const stored = localStorage.getItem("theme");
//     if (stored === "dark") return true;
//     if (stored === "light") return false;
//     return window.matchMedia("(prefers-color-scheme: dark)").matches;
//   };

//   const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", isDarkMode);
//     localStorage.setItem("theme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   return (
//     <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("light", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
