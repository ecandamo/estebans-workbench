import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True after client hydration — avoids theme-toggle SSR mismatch without useEffect setState. */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
