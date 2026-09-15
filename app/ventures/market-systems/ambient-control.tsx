"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./storefront.module.css";

type AmbientNodes = { context: AudioContext; master: GainNode; timer: number | null };

export default function AmbientControl() {
  const audioRef = useRef<AmbientNodes | null>(null);
  const enabledRef = useRef(true);
  const beatRef = useRef(0);
  const [enabled, setEnabled] = useState(true);
  const [started, setStarted] = useState(false);

  const stopAmbient = useCallback(() => {
    const current = audioRef.current;
    audioRef.current = null;
    if (!current) return;
    if (current.timer !== null) window.clearInterval(current.timer);
    if (current.context.state !== "closed") void current.context.close();
    setStarted(false);
  }, []);

  const startAmbient = useCallback(async () => {
    if (!enabledRef.current || typeof window === "undefined") return;
    if (audioRef.current) {
      if (audioRef.current.context.state === "suspended") await audioRef.current.context.resume();
      setStarted(true);
      return;
    }

    const context = new AudioContext();
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 24;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.35;

    const master = context.createGain();
    master.gain.value = 0.24;
    compressor.connect(master);
    master.connect(context.destination);

    const padBus = context.createGain();
    padBus.gain.value = 0.11;
    const padFilter = context.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 1100;
    padFilter.Q.value = 0.55;
    padBus.connect(padFilter);
    padFilter.connect(compressor);

    [110, 164.81, 220, 277.18].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index % 2 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index % 2 ? 4 : -3;
      gain.gain.value = index === 0 ? 0.18 : 0.09;
      oscillator.connect(gain);
      gain.connect(padBus);
      oscillator.start();
    });

    function noiseHit(now: number, gainValue: number, duration: number, highpass: number) {
      const length = Math.max(1, Math.floor(context.sampleRate * duration));
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      filter.type = "highpass";
      filter.frequency.value = highpass;
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(compressor);
      source.start(now);
    }

    const tick = () => {
      const active = audioRef.current;
      if (!active) return;
      const now = context.currentTime + 0.02;
      const beat = beatRef.current % 8;

      if (beat % 2 === 0) {
        const kick = context.createOscillator();
        const gain = context.createGain();
        kick.type = "sine";
        kick.frequency.setValueAtTime(88, now);
        kick.frequency.exponentialRampToValueAtTime(47, now + 0.24);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
        kick.connect(gain);
        gain.connect(compressor);
        kick.start(now);
        kick.stop(now + 0.36);
      }

      if (beat === 2 || beat === 6) noiseHit(now, 0.045, 0.2, 1200);
      if (beat % 2 === 1) noiseHit(now, 0.014, 0.07, 4800);

      if (beat === 0 || beat === 3 || beat === 5) {
        const melody = [329.63, 392, 440, 392, 329.63, 293.66, 329.63, 392];
        const note = context.createOscillator();
        const noteGain = context.createGain();
        const filter = context.createBiquadFilter();
        note.type = "sine";
        note.frequency.value = melody[beat];
        filter.type = "lowpass";
        filter.frequency.value = 1800;
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.055, now + 0.035);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        note.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(compressor);
        note.start(now);
        note.stop(now + 0.9);
      }

      beatRef.current += 1;
    };

    audioRef.current = { context, master, timer: null };
    tick();
    audioRef.current.timer = window.setInterval(tick, 750);
    if (context.state === "suspended") await context.resume();
    setStarted(true);
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
    if (next) await startAmbient(); else stopAmbient();
  }

  return <button className={styles.navAudio} type="button" onClick={toggle} aria-pressed={enabled} title={enabled && !started ? "Tap once to start the marketplace beat" : undefined} aria-label={enabled ? "Turn marketplace ambient music off" : "Turn marketplace ambient music on"}>
    <Music2 size={15}/><span className={styles.navAudioLabel}>Ambient</span><strong>{enabled ? (started ? "ON" : "READY") : "OFF"}</strong>{enabled ? <Volume2 size={14}/> : <VolumeX size={14}/>} 
  </button>;
}
