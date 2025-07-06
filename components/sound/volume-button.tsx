"use client";

import { Volume2, VolumeOff } from "lucide-react";
import { useState } from "react";

interface VolumeButtonProps {
  initialState?: boolean;
  onToggle: (isOn: boolean) => void;
}

export default function VolumeButton({
  initialState = false,
  onToggle,
}: VolumeButtonProps) {
  const [isOn, setIsOn] = useState(initialState);
  const iconClassName = "w-4 h-4 text-stone-950";
  const icon = isOn ? (
    <Volume2 className={iconClassName} />
  ) : (
    <VolumeOff className={iconClassName} />
  );
  const toggleVolume = () => {
    setIsOn(!isOn);
    onToggle(!isOn);
  };

  return (
    <button
      onClick={toggleVolume}
      className="p-2 rounded-full bg-white/80 hover:bg-white/100 transition-colors cursor-pointer"
    >
      {icon}
    </button>
  );
}
