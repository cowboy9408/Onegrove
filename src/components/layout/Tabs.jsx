import React, { useState, Children, cloneElement } from "react";

export function TabPanel({ children, isActive, className = "" }) {
  return isActive ? <div className={`${className}`}>{children}</div> : null;
}

export default function Tabs({ tabs = [], defaultIndex = 0, children, onTabChange }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    if (onTabChange) onTabChange(index); // 외부에 현재 탭 인덱스 전달
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-around border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(index)}
            className={`flex-1 cursor-pointer border-r border-gray-200 px-4 py-2 text-sm font-medium transition-colors last:border-r-0 dark:border-gray-700 ${
              index === activeIndex
                ? "border-b-2 border-black text-black dark:border-white dark:text-white"
                : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full">
        {Children.map(children, (child, index) =>
          cloneElement(child, {
            isActive: index === activeIndex,
            tabIndex: activeIndex, // 현재 탭 인덱스 전달 (원하면 사용)
          })
        )}
      </div>
    </div>
  );
}
