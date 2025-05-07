import React from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showConfirm = false,
  showCancel = false,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        {/* 제목 */}
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-black">
            {title}
          </h2>
        )}

        {/* 내용 */}
        <div className="mb-6 text-sm text-black">
          {children}
        </div>

        {/* 버튼 영역 */}
        {(showConfirm || showCancel) && (
          <div className="flex justify-end space-x-2">
            {showCancel && (
              <button
                onClick={onClose}
                className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-900"
              >
                {cancelText}
              </button>
            )}
            {showConfirm && (
              <button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-900"
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
