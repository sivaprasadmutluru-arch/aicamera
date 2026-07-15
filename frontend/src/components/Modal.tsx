import type { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-ink-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-700">
          <h2 className="text-base font-semibold text-ink-800 dark:text-ink-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
