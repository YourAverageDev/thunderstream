import { useEffect, useState } from "react";
import { providers, getSavedProvider, saveProvider, type ProviderId } from "@/lib/stream";
import { TvSelect } from "@/components/TvSelect";

export function ProviderSelect({
  value,
  onChange,
}: {
  value: ProviderId;
  onChange: (id: ProviderId) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span>Source:</span>
      <TvSelect
        value={value}
        options={providers.map((p) => ({ value: p.id, label: p.name }))}
        onChange={(id) => {
          saveProvider(id);
          onChange(id);
        }}
      />
    </div>
  );
}

export function useProvider() {
  const [id, setId] = useState<ProviderId>(providers[0].id);
  useEffect(() => setId(getSavedProvider()), []);
  return [id, setId] as const;
}
