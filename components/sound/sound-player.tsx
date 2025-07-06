"use client";

import { useRef } from "react";
import VolumeButton from "./volume-button";

interface SoundPlayerProps {
  className?: string;
}

export default function SoundPlayer({ className }: SoundPlayerProps) {
  const playerRef = useRef<HTMLAudioElement>(null);
  const handleVolumeToggle = (isOn: boolean) => {
    if (playerRef.current) {
      playerRef.current.muted = !isOn;
      if (isOn && playerRef.current.paused) {
        playerRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      } else if (!isOn && !playerRef.current.paused) {
        playerRef.current.pause();
      }
    }
  };

  return (
    <div className={`${className}`}>
      <audio
        ref={playerRef}
        src="/sounds/bg-music.mp3"
        loop
        controls={false}
        className="invisible"
      />
      <VolumeButton onToggle={handleVolumeToggle} />
    </div>
  );
}
