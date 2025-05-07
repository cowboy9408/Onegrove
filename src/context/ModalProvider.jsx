import { XIcon } from "@/components/ui/x";
import { Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "./ModalContext";

export function ModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [customContent, setCustomContent] = useState(null);
  const [onConfirm, setOnConfirm] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [size, setSize] = useState("md");
  const [customContentRef, setCustomContentRef] = useState(null);
  const [childResult, setChildResult] = useState(null);
  const [customButton, setCustomButton] = useState(false);
  const [confirmButton, setConfirmButton] = useState("확인");

  const sizeClassMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  const modalSizeClass = sizeClassMap[size] || "max-w-md";

  const showModal = useCallback(
    ({
      title = "",
      message = "",
      children = null,
      onConfirm,
      showCancel = false,
      size = "md",
      customButton = false,
      confirmButton = "확인",
    }) => {
      setTitle(title);
      setMessage(message);
      setOnConfirm(() => onConfirm);
      setShowCancel(showCancel);
      setOpen(true);
      setSize(size);
      setCustomButton(customButton);
      setConfirmButton(confirmButton);

      if (typeof children === "function") {
        setCustomContentRef(() => children);
        setCustomContent(null);
      } else {
        setCustomContent(children);
        setCustomContentRef(() => {});
      }
    },
    []
  );

  const closeModal = useCallback(() => {
    setOpen(false);
    setTitle("");
    setMessage("");
    setCustomContent(null);
    setCustomContentRef(null);
    setOnConfirm(null);
    setShowCancel(false);
    setSize("md");
    setCustomButton(false);
    setChildResult(null);
    setConfirmButton("확인");
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") closeModal();
    },
    [closeModal]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(childResult);
    }
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`animate-fadeIn relative w-full ${modalSizeClass} rounded-xl bg-white p-6 text-center shadow-xl transition-all dark:bg-gray-900`}
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
                aria-label="닫기"
              >
                <XIcon size={20} />
              </button>

              {title && (
                <div className="mb-4 flex items-center justify-center text-gray-800 dark:text-white">
                  <Info className="mr-2" size={20} />
                  <h2 className="text-lg font-semibold">{title}</h2>
                </div>
              )}

              <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                {customContentRef
                  ? customContentRef({ closeModal: closeModal })
                  : customContent || <p>{message}</p>}
              </div>

              {!customButton && (
                <div className="flex justify-center gap-3">
                  
                  <button
                    className="rounded-md bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
                    onClick={handleConfirm}
                  >
                    {confirmButton}
                  </button>
                  {showCancel && (
                    <button
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={closeModal}
                    >
                      취소
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
