import type { AnimPresetName, AnimParams } from "./types";

export function generateKeyframes(preset: AnimPresetName, params: AnimParams): string {
  const { floatHeight: fh, scale: sc, rotation: ro } = params;

  const MAP: Record<AnimPresetName, string> = {
    float: `
@keyframes anim-float {
  0%, 49% { transform: translateY(0); }
  50%, 100% { transform: translateY(-${fh}px); }
}`,
    flicker: `
@keyframes anim-float {
  0%, 49% { transform: translateY(0); }
  50%, 100% { transform: translateY(-${fh}px); }
}`,
    pulse: `
@keyframes anim-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(${sc}); }
}`,
    shake: `
@keyframes anim-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-${fh / 2}px); }
  75% { transform: translateX(${fh / 2}px); }
}`,
    spin: `
@keyframes anim-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(${ro}deg); }
}`,
    wave: `
@keyframes anim-wave {
  0%, 100% { transform: skewX(0deg) translateY(0); }
  50% { transform: skewX(-${fh}deg) translateY(-${Math.round(fh / 3)}px); }
}`,
    bounce: `
@keyframes anim-bounce {
  0%, 100% { transform: translateY(0) scaleY(1); }
  40% { transform: translateY(-${fh}px) scaleY(1.1); }
  60% { transform: translateY(-${Math.round(fh * 0.5)}px) scaleY(0.95); }
}`,
    drift: `
@keyframes anim-drift {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(${Math.round(fh / 2)}px, -${Math.round(fh / 3)}px); }
  50% { transform: translate(${fh}px, 0); }
  75% { transform: translate(${Math.round(fh / 2)}px, ${Math.round(fh / 3)}px); }
}`,
    heartbeat: `
@keyframes anim-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(${sc}); }
  28% { transform: scale(1); }
  42% { transform: scale(${(sc * 0.9).toFixed(2)}); }
  70% { transform: scale(1); }
}`,
    glitch: `
@keyframes anim-glitch {
  0%, 100% { transform: translate(0, 0) skew(0deg); }
  20% { transform: translate(${Math.round(fh / 3)}px, 0) skew(${ro}deg); }
  40% { transform: translate(-${Math.round(fh / 3)}px, ${Math.round(fh / 4)}px) skew(-${ro}deg); }
  60% { transform: translate(${Math.round(fh / 5)}px, -${Math.round(fh / 5)}px) skew(${Math.round(ro / 2)}deg); }
}`,
  };

  return (
    (MAP[preset] || MAP.float) +
    `
@keyframes anim-flicker0 {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes anim-flicker1 {
  0%, 49% { opacity: 0; }
  50%, 100% { opacity: 1; }
}
@keyframes anim-shadow {
  0%, 49% { opacity: 0.5; transform: translateX(-50%) scaleX(1); }
  50%, 100% { opacity: 0.15; transform: translateX(-50%) scaleX(0.75); }
}
@keyframes anim-eyes {
  0%, 49% { transform: translateX(0); }
  50%, 99% { transform: translateX(10px); }
  100% { transform: translateX(0); }
}`
  );
}

export function getAnimationName(preset: AnimPresetName): string {
  const MAP: Record<AnimPresetName, string> = {
    float: "anim-float",
    flicker: "anim-float",
    pulse: "anim-pulse",
    shake: "anim-shake",
    spin: "anim-spin",
    wave: "anim-wave",
    bounce: "anim-bounce",
    drift: "anim-drift",
    heartbeat: "anim-heartbeat",
    glitch: "anim-glitch",
  };
  return MAP[preset] || "anim-float";
}
