'use client';

import { CanvasRevealEffect } from '@/components/ui/sign-in-flow-1';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <CanvasRevealEffect
        animationSpeed={3}
        containerClassName="bg-black"
        colors={[
          [255, 255, 255],
          [255, 255, 255],
        ]}
        dotSize={6}
        reverse={false}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
    </div>
  );
}

