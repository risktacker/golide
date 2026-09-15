"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./storefront.module.css";

export default function AmbientControl() {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const enabledRef = useRef(true);
  const [enabled, setEnabled] = useState(true);

  const stopAmbient = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    masterRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") void context.close();
  }, []);

  const startAmbient = useCallback(async () => {
    if (!enabledRef.current || typeof window === "undefined") return;

    if (contextRef.current) {
      if (contextRef.current.state === "suspended") await contextRef.current.resume();
      return;
    }

    const context = new AudioContext();
    contextRef.current = context;

    const master = context.createGain();
    master.gain.value = 0.055;
    master.connect(context.destination);
    masterRef.current = master;

    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 900;
    lowpass.Q.value = 0.45;
    lowpass.connect(master);

    [73.42, 110, 146.83].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.018 : 0.009;
      oscillator.connect(gain);
      gain.connect(lowpass);
      oscillator.start();
    });

    const pulse = () => {
      const activeContext = contextRef.current;
      const activeMaster = masterRef.current;
      if (!activeContext || !activeMaster) return;

      const now = activeContext.currentTime;
      const kick = activeContext.createOscillator();
      const kickGain = activeContext.createGain();
      kick.type = "sine";
      kick.frequency.setValueAtTime(78, now);
      kick.frequency.exponentialRampToValueAtTime(46, now + 0.22);
      kickGain.gain.setValueAtTime(0.0001, now);
      kickGain.gain.exponentialRampToValueAtTime(0.075, now + 0.012);
      kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      kick.connect(kickGain);
      kickGain.connect(activeMaster);
      kick.start(now);
      kick.stop(now + 0.36);

      if (stepRef.current % 2 === 0) {
        const note = [293.66, 329.63, 440][(stepRef.current / 2) % 3];
        const chime = activeContext.createOscillator();
        const chimeGain = activeContext.createGain();
        const chimeFilter = activeContext.createBiquadFilter();
        chime.type = "sine";
        chime.frequency.value = note;
        chimeFilter.type = "lowpass";
        chimeFilter.frequency.value = 1600;
        chimeGain.gain.setValueAtTime(0.0001, now + 0.08);
        chimeGain.gain.exponentialRampToValueAtTime(0.018, now + 0.12);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
        chime.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(activeMaster);
        chime.start(now + 0.08);
        chime.stop(now + 1.5);
      }

      stepRef.current += 1;
    };

    pulse();
    timerRef.current = window.setInterval(pulse, 1600);
    if (context.state === "suspended") await context.resume();
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("golide-market-ambient");
    const shouldEnable = saved !== "off";
    enabledRef.current = shouldEnable;
    setEnabled(shouldEnable);
    if (!shouldEnable) return;

    const unlock = () => void startAmbient();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [startAmbient]);

  useEffect(() => () => stopAmbient(), [stopAmbient]);

  async function toggle() {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    window.localStorage.setItem("golide-market-ambient", next ? "on" : "off");
    if (next) await startAmbient();
    else stopAmbient();
  }

  return (
    <button className={styles.navAudio} type="button" onClick={toggle} aria-pressed={enabled} aria-label={enabled ? "Turn marketplace ambient music off" : "Turn marketplace ambient music on"}>
      <Music2 size={15}/>
      <span className={styles.navAudioLabel}>Ambient</span>
      <strong>{enabled ? "ON" : "OFF"}</strong>
      {enabled ? <Volume2 size={14}/> : <VolumeX size={14}/>}
    </button>
  );
}
