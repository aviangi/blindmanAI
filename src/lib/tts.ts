"use client";

export const speak = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      resolve();
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

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      resolve(); // Resolve even on error to not block the app
    };

    // A slight delay can help ensure the previous speech is fully cancelled.
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  });
};
