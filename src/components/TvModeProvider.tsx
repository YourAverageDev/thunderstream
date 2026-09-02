import { useEffect } from "react";
import { useTvMode } from "@/hooks/useTvMode";
import { useSpatialNav } from "@/hooks/useSpatialNav";
import { registerTizenKeys } from "@/lib/tizen";
import type { ReactNode } from "react";

export function TvModeProvider({ children }: { children: ReactNode }) {
  const tv = useTvMode();
  useSpatialNav(tv);
  useEffect(() => {
    registerTizenKeys();
  }, []);
  return <>{children}</>;
}
