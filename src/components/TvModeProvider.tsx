import { useTvMode } from "@/hooks/useTvMode";
import { useSpatialNav } from "@/hooks/useSpatialNav";
import type { ReactNode } from "react";

export function TvModeProvider({ children }: { children: ReactNode }) {
  const tv = useTvMode();
  useSpatialNav(tv);
  return <>{children}</>;
}
