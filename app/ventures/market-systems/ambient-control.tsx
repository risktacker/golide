"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./storefront.module.css";

const TRACK_URL = "/audio/marketplace/easy-monday.mp3";
const TRACK_VOLUME = 0.34;

export default function AmbientControl() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enabledRef = useRef(true);
  const startedRef = useRef(false);
  const pausedByBackgroundRef = useRef(false);
  const [enabled, setEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const setPlayingState = useCallback((playing: boolean) => {
    startedRef.current = playing;
    setStarted(playing);
  }, []);

  const ensureAudio = useCallback(() => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(TRACK_URL);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = TRACK_VOLUME;
      audio.addEventListener("error", () => {
        setPlayingState(false);
        setFailed(true);
      });
      audioRef.current = audio;
    }
    audio.volume = TRACK_VOLUME;
    return audio;
  }, [setPlayingState]);

  const startAmbient = useCallback(async () => {
    if (!enabledRef.current || typeof window === "undefined" || document.hidden) return false;
    const audio = ensureAudio();
    try {
      await audio.play();
      setPlayingState(true);
      setFailed(false);
      return true;
    } catch {
      setPlayingState(false);
      setFailed(true);
      return false;
    }
  }, [ensureAudio, setPlayingState]);

  const stopAmbient = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    pausedByBackgroundRef.current = false;
    setPlayingState(false);
  }, [setPlayingState]);

  const pauseForBackground = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    pausedByBackgroundRef.current = enabledRef.current;
    audio.pause();
    setPlayingState(false);
  }, [setPlayingState]);

  const resumeFromBackground = useCallback(async () => {
    if (!pausedByBackgroundRef.current || !enabledRef.current || document.hidden) return;
    const resumed = await startAmbient();
    if (resumed) pausedByBackgroundRef.current = false;
  }, [startAmbient]);

  useEffect(() => {
    const saved = window.localStorage.getItem("golide-market-ambient");
    const shouldEnable = saved !== "off";
    enabledRef.current = shouldEnable;
    setEnabled(shouldEnable);
    if (!shouldEnable) return;

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

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) pauseForBackground();
      else void resumeFromBackground();
    };
    const handleBlur = () => pauseForBackground();
    const handleFocus = () => void resumeFromBackground();
    const handlePageHide = () => pauseForBackground();
    const handlePageShow = () => void resumeFromBackground();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pauseForBackground, resumeFromBackground]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    audioRef.current = null;
    pausedByBackgroundRef.current = false;
    startedRef.current = false;
  }, []);

  async function toggle() {
    if (enabledRef.current && !startedRef.current) {
      pausedByBackgroundRef.current = false;
      await startAmbient();
      return;
    }

    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    window.localStorage.setItem("golide-market-ambient", next ? "on" : "off");
    if (next) {
      pausedByBackgroundRef.current = false;
      await startAmbient();
    } else {
      stopAmbient();
    }
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
