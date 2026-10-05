"use client";
import { useEffect, useState } from "react";
import { suitableVoice } from "@/lib/speech";
export function useCourseSpeech(locale: string, contentKey: string) {
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setNotice("Audio is unavailable in this browser. Read the text below.");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const refresh = () =>
      setNotice(
        suitableVoice(synth.getVoices(), locale)
          ? ""
          : "No suitable language voice is available. Read the text below, or retry after voices load.",
      );
    refresh();
    synth.addEventListener("voiceschanged", refresh);
    return () => {
      synth.removeEventListener("voiceschanged", refresh);
      synth.cancel();
    };
  }, [locale, contentKey]);
  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setNotice("Audio is unavailable in this browser. Read the text below.");
      return;
    }
    const synth = window.speechSynthesis,
      voice = suitableVoice(synth.getVoices(), locale);
    synth.cancel();
    if (!voice) {
      setNotice(
        "No suitable language voice is available. Read the text below, or retry after voices load.",
      );
      return;
    }
    setNotice("");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.voice = voice;
    utterance.rate = 0.8;
    utterance.onerror = (event) => {
      if (!["canceled", "interrupted"].includes(event.error))
        setNotice("Audio failed. Read the text below.");
    };
    try {
      synth.speak(utterance);
    } catch {
      setNotice("Audio failed. Read the text below.");
    }
  }
  return { speak, notice };
}
