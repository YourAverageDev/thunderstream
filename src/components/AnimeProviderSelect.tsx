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
import { TvSelect } from "@/components/TvSelect";

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
        <TvSelect
          value={provider}
          options={animeProviders.map((p) => ({ value: p.id, label: p.name }))}
          onChange={(id) => {
            saveAnimeProvider(id);
            onProviderChange(id);
          }}
        />
      </div>
      <TvSelect
        value={audio}
        options={[
          { value: "sub", label: "Sub" },
          { value: "dub", label: "Dub" },
        ]}
        onChange={(value) => {
          saveAnimeAudio(value);
          onAudioChange(value);
        }}
      />
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
