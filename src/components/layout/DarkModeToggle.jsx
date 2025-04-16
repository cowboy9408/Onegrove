import useTheme from "@/hooks/useTheme";
import { MoonIcon } from "../ui/moon";
import { SunIcon } from "../ui/sun";

const DarkModeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex cursor-pointer items-center justify-center rounded-md p-2 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <SunIcon
        size={20}
        className={`absolute transition-all duration-300 ${
          isDarkMode ? "scale-75 rotate-45 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <MoonIcon
        size={20}
        className={`absolute transition-all duration-300 ${
          isDarkMode ? "scale-100 opacity-100" : "scale-75 -rotate-45 opacity-0"
        }`}
      />
    </button>
  );
};

export default DarkModeToggle;
