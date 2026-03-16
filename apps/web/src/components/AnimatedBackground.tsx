"use client";

import { SpaceBackground } from "@/components/ui/space-background";

export function AnimatedBackground() {
  return <SpaceBackground particleCount={350} particleColor="rgba(255,255,255,0.7)" backgroundColor="transparent" />;
}
