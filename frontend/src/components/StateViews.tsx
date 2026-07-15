export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-24 text-ink-400 text-sm">
      Loading...
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3">
      {message}
    </div>
  );
}

export function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-ink-400 text-sm">{message}</div>
  );
}
