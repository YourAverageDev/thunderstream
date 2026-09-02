import { useEffect, useState } from "react";
import {
  animeProviders,
  getSavedAnimeAudio,
  getSavedAnimeProvider,
  saveAnimeAudio,
  saveAnimeProvider,
  type AnimeAudio,
  type AnimeProviderId,
} from "@/lib/animeStream";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AnimeProviderSelect({
  provider,
  audio,
  onProviderChange,
  onAudioChange,
}: {
  provider: AnimeProviderId;
  audio: AnimeAudio;
  onProviderChange: (id: AnimeProviderId) => void;
  onAudioChange: (audio: AnimeAudio) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <div className="inline-flex items-center gap-2">
        <span>Source:</span>
        <Select
          value={provider}
          onValueChange={(id) => {
            const providerId = id as AnimeProviderId;
            saveAnimeProvider(providerId);
            onProviderChange(providerId);
          }}
        >
          <SelectTrigger className="h-auto w-auto gap-1.5 rounded border-border bg-secondary/80 px-2 py-1 text-xs text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {animeProviders.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Select
        value={audio}
        onValueChange={(value) => {
          const audioValue = value as AnimeAudio;
          saveAnimeAudio(audioValue);
          onAudioChange(audioValue);
        }}
      >
        <SelectTrigger className="h-auto w-auto gap-1.5 rounded border-border bg-secondary/80 px-2 py-1 text-xs text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sub">Sub</SelectItem>
          <SelectItem value="dub">Dub</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function useAnimeProviderPrefs() {
  const [provider, setProvider] = useState<AnimeProviderId>(animeProviders[0].id);
  const [audio, setAudio] = useState<AnimeAudio>("sub");
  useEffect(() => {
    setProvider(getSavedAnimeProvider());
    setAudio(getSavedAnimeAudio());
  }, []);
  return { provider, setProvider, audio, setAudio };
}
