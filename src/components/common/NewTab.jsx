import { useState } from "react";
import Button from "./Button";

export default function Tabs({ tabs, onChange, initialTab = 0 }) {
  const [activeIndex, setActiveIndex] = useState(initialTab);

  const handleClick = (index) => {
    setActiveIndex(index);
    if (onChange) onChange(index);
  };

  return (
    <div className="flex space-x-2">
      {tabs.map((tab, index) => (
        <Button
          key={index}
          onClick={() => handleClick(index)}
          variant={activeIndex === index ? "default" : "white"}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
}
