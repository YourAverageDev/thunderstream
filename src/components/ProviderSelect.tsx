import { useEffect, useState } from "react";
import { providers, getSavedProvider, saveProvider, type ProviderId } from "@/lib/stream";

export function ProviderSelect({ value, onChange }: { value: ProviderId; onChange: (id: ProviderId) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span>Source:</span>
      <select
        value={value}
        onChange={(e) => {
          const id = e.target.value as ProviderId;
          saveProvider(id);
          onChange(id);
        }}
        className="bg-secondary/80 border border-border rounded px-2 py-1 text-foreground text-xs outline-none focus:border-primary"
      >
        {providers.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </label>
  );
}

export function useProvider() {
  const [id, setId] = useState<ProviderId>(providers[0].id);
  useEffect(() => setId(getSavedProvider()), []);
  return [id, setId] as const;
}
