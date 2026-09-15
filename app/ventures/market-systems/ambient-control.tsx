"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./storefront.module.css";

const TRACK_URL = "/audio/marketplace/easy-monday.mp3";
const TRACK_VOLUME = 0.62;

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

  const ensureAudio = useCallback(() => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(TRACK_URL);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = TRACK_VOLUME;
      audio.addEventListener("error", () => {
        startedRef.current = false;
        setStarted(false);
        setFailed(true);
      });
      audioRef.current = audio;
    }
    audio.volume = TRACK_VOLUME;
    return audio;
  }, []);

  const startAmbient = useCallback(async () => {
    if (!enabledRef.current || typeof window === "undefined") return;
    const audio = ensureAudio();
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
  }, [ensureAudio]);

  useEffect(() => {
    const saved = window.localStorage.getItem("golide-market-ambient");
    const shouldEnable = saved !== "off";
    enabledRef.current = shouldEnable;
    setEnabled(shouldEnable);
    if (!shouldEnable) return;

    // Browsers block audible autoplay until the visitor interacts. Prime the
    // local track immediately, then start it on the first normal interaction.
    ensureAudio().load();

    const unlockPointer = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-market-audio-control]")) return;
      window.removeEventListener("pointerdown", unlockPointer);
      window.removeEventListener("keydown", unlockKey);
      void startAmbient();
    };
    const unlockKey = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-market-audio-control]")) return;
      window.removeEventListener("pointerdown", unlockPointer);
      window.removeEventListener("keydown", unlockKey);
      void startAmbient();
    };

    window.addEventListener("pointerdown", unlockPointer);
    window.addEventListener("keydown", unlockKey);
    return () => {
      window.removeEventListener("pointerdown", unlockPointer);
      window.removeEventListener("keydown", unlockKey);
    };
  }, [ensureAudio, startAmbient]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
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
