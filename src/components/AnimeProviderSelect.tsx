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
      <label className="inline-flex items-center gap-2">
        <span>Source:</span>
        <select
          value={provider}
          onChange={(e) => {
            const id = e.target.value as AnimeProviderId;
            saveAnimeProvider(id);
            onProviderChange(id);
          }}
          className="bg-secondary/80 border border-border rounded px-2 py-1 text-foreground text-xs outline-none focus:border-primary"
        >
          {animeProviders.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-2">
        <select
          value={audio}
          onChange={(e) => {
            const value = e.target.value as AnimeAudio;
            saveAnimeAudio(value);
            onAudioChange(value);
          }}
          className="bg-secondary/80 border border-border rounded px-2 py-1 text-foreground text-xs outline-none focus:border-primary"
        >
          <option value="sub">Sub</option>
          <option value="dub">Dub</option>
        </select>
      </label>
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
