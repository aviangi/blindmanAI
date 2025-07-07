"use client";

export const speak = (text: string): void => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech before starting a new one
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  // A slight delay can help ensure the previous speech is fully cancelled.
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
};
