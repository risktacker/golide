"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./storefront.module.css";

// Mixkit — “Easy Monday” by Michael Ramir C.
// This is the exact Mixkit asset supplied for the marketplace atmosphere.
const TRACK_URL = "https://assets.mixkit.co/music/preview/mixkit-easy-monday-1025.mp3";
const TRACK_VOLUME = 0.58;

export default function AmbientControl() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enabledRef = useRef(true);
  const startedRef = useRef(false);
  const [enabled, setEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const stopAmbient = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    startedRef.current = false;
    setStarted(false);
  }, []);

  const startAmbient = useCallback(async () => {
    if (!enabledRef.current || typeof window === "undefined") return;

    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(TRACK_URL);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = TRACK_VOLUME;
      audioRef.current = audio;
    }

    audio.volume = TRACK_VOLUME;
    try {
      await audio.play();
      startedRef.current = true;
      setStarted(true);
      setFailed(false);
    } catch {
      startedRef.current = false;
      setStarted(false);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("golide-market-ambient");
    const shouldEnable = saved !== "off";
    enabledRef.current = shouldEnable;
    setEnabled(shouldEnable);
    if (!shouldEnable) return;

    // Audible autoplay is blocked by browsers. Start the track on the first
    // normal interaction anywhere in the marketplace, while letting the audio
    // control handle its own click without immediately switching itself off.
    const unlockClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-market-audio-control]")) return;
      window.removeEventListener("click", unlockClick);
      window.removeEventListener("keydown", unlockKey);
      void startAmbient();
    };
    const unlockKey = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-market-audio-control]")) return;
      window.removeEventListener("click", unlockClick);
      window.removeEventListener("keydown", unlockKey);
      void startAmbient();
    };

    window.addEventListener("click", unlockClick);
    window.addEventListener("keydown", unlockKey);
    return () => {
      window.removeEventListener("click", unlockClick);
      window.removeEventListener("keydown", unlockKey);
    };
  }, [startAmbient]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      audio.load();
    }
    audioRef.current = null;
    startedRef.current = false;
  }, []);

  async function toggle() {
    if (enabledRef.current && !startedRef.current) {
      await startAmbient();
      return;
    }

    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    window.localStorage.setItem("golide-market-ambient", next ? "on" : "off");
    if (next) await startAmbient();
    else stopAmbient();
  }

  const stateLabel = !enabled ? "OFF" : started ? "ON" : failed ? "PLAY" : "READY";
  const title = failed
    ? "Tap to play Easy Monday"
    : enabled && !started
      ? "Tap once to start Easy Monday"
      : undefined;

  return <button
    className={styles.navAudio}
    data-market-audio-control
    type="button"
    onClick={toggle}
    aria-pressed={enabled && started}
    title={title}
    aria-label={enabled && started ? "Turn marketplace music off" : "Play marketplace music"}
  >
    <Music2 size={15}/>
    <span className={styles.navAudioLabel}>Music</span>
    <strong>{stateLabel}</strong>
    {enabled ? <Volume2 size={14}/> : <VolumeX size={14}/>}
  </button>;
}
