"use client";

import React, { useEffect, useRef } from "react";

export type DialogBoxProps = {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmVariant?: "danger" | "primary";
  disableBackdropClose?: boolean;
  isConfirmLoading?: boolean;
  disableCancel?: boolean;
};

const DialogBox: React.FC<DialogBoxProps> = ({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  disableBackdropClose = false,
  isConfirmLoading = false,
  disableCancel = false,
}) => {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      // focus cancel by default
      cancelRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !disableBackdropClose) onCancel();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onCancel, disableBackdropClose]);

  if (!open) return null;

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (!disableBackdropClose) onCancel();
        }}
      />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "dialog-title" : undefined}
          className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/10 dark:ring-white/10"
        >
          {title && (
            <div className="px-4 pt-4">
              <h2 id="dialog-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            </div>
          )}
          {description && (
            <div className="px-4 pt-2 text-sm text-gray-600 dark:text-gray-300">
              {description}
            </div>
          )}
          <div className="px-4 py-4 flex items-center justify-end gap-2">
            <button
              ref={cancelRef}
              type="button"
              disabled={disableCancel}
              className={`px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 ${disableCancel ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => { if (!disableCancel) onCancel(); }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={isConfirmLoading}
              className={
                confirmVariant === "danger"
                  ? `px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-500 ${isConfirmLoading ? 'opacity-70 cursor-not-allowed' : ''}`
                  : `px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500 ${isConfirmLoading ? 'opacity-70 cursor-not-allowed' : ''}`
              }
              onClick={() => { if (!isConfirmLoading) onConfirm(); }}
            >
              <span className="inline-flex items-center gap-2">
                {isConfirmLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {confirmLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
