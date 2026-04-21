import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 200;

export function useDelayedSkeleton(
  isLoading: boolean,
  hasData: boolean,
  delayMs = DEFAULT_DELAY_MS
) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isLoading || hasData) {
      setShowSkeleton(false);
      return;
    }

    const timerId = window.setTimeout(() => {
      setShowSkeleton(true);
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [delayMs, hasData, isLoading]);

  return showSkeleton;
}
