import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function DropdownMenu({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [origin, setOrigin] = useState("top-left");
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const dropdownWidth = dropdownRef.current.offsetWidth;
    const dropdownHeight = dropdownRef.current.offsetHeight;

    let top = rect.bottom + scrollY + 8; // 적절한 간격
    let left = rect.left + scrollX;
    let newOrigin = "top-left";

    if (rect.left + dropdownWidth > vw - 16) {
      left = Math.max(16 + scrollX, rect.right + scrollX - dropdownWidth);
      newOrigin = "top-right";
    }

    if (rect.bottom + dropdownHeight > vh - 16) {
      top = Math.max(16 + scrollY, rect.top + scrollY - dropdownHeight - 8);
      newOrigin = newOrigin.replace("top", "bottom");
    }

    setPosition({ top, left });
    setOrigin(newOrigin);
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        calculatePosition();
      }, 10);

      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
        window.removeEventListener("scroll", calculatePosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      calculatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        !document.getElementById("dropdown-portal")?.contains(e.target)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={triggerRef} onClick={toggle} className="w-full cursor-pointer">
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            id="dropdown-portal"
            ref={dropdownRef}
            className={`absolute z-50 min-w-[160px] rounded-md border border-gray-100 bg-white shadow-md transition-opacity duration-200 ease-out origin-${origin} animate-fadeIn`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {children}
          </div>,
          document.body
        )}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .origin-top-left {
          transform-origin: top left;
        }
        .origin-top-right {
          transform-origin: top right;
        }
        .origin-bottom-left {
          transform-origin: bottom left;
        }
        .origin-bottom-right {
          transform-origin: bottom right;
        }
      `}</style>
    </>
  );
}
