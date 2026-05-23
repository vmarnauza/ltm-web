"use client";
import { useState } from "react";
import Background from "./background";
import LoadingBar from "./loading-bar";

interface LoadingGateProps {
  children: React.ReactNode;
}

export default function LoadingGate({ children }: LoadingGateProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Background onProgress={setProgress} />
      {!loaded && (
        <LoadingBar progress={progress} onComplete={() => setLoaded(true)} />
      )}
      <div style={{ visibility: loaded ? "visible" : "hidden" }}>
        {children}
      </div>
    </>
  );
}
