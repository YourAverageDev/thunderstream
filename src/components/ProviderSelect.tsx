import { useEffect, useState } from "react";
import { providers, getSavedProvider, saveProvider, type ProviderId } from "@/lib/stream";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <Select
        value={value}
        onValueChange={(id) => {
          const providerId = id as ProviderId;
          saveProvider(providerId);
          onChange(providerId);
        }}
      >
        <SelectTrigger className="h-auto w-auto gap-1.5 rounded border-border bg-secondary/80 px-2 py-1 text-xs text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {providers.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function useProvider() {
  const [id, setId] = useState<ProviderId>(providers[0].id);
  useEffect(() => setId(getSavedProvider()), []);
  return [id, setId] as const;
}
