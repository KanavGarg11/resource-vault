"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  showBanner: boolean;
  showIosModal: boolean;
  setShowBanner: (show: boolean) => void;
  setShowIosModal: (show: boolean) => void;
  promptInstall: () => Promise<void>;
  dismissBanner: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  showBanner: false,
  showIosModal: false,
  setShowBanner: () => {},
  setShowIosModal: () => {},
  promptInstall: async () => {},
  dismissBanner: () => {},
});

export function usePwa() {
  return useContext(PwaContext);
}

const DISMISS_KEY = "lifevault_pwa_banner_dismissed_at";
const DISMISS_DURATION_DAYS = 3;

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("LifeVault Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("LifeVault Service Worker registration error:", err);
          });
      });
    }

    // 2. Check if already running in standalone mode (installed app)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;
    setIsIos(isIosDevice);

    // 4. Check dismissal cooldown
    const checkDismissalCooldown = (): boolean => {
      try {
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (!dismissedAt) return true;
        const diffMs = Date.now() - parseInt(dismissedAt, 10);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays > DISMISS_DURATION_DAYS;
      } catch {
        return true;
      }
    };

    const canShowBanner = checkDismissalCooldown();

    // 5. Listen for Chromium/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      if (canShowBanner) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // If on iOS and not standalone, can offer banner after a brief pleasant delay
    if (isIosDevice && canShowBanner) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else if (isIos) {
      setShowIosModal(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable: isInstallable || isIos,
        isInstalled,
        isIos,
        showBanner,
        showIosModal,
        setShowBanner,
        setShowIosModal,
        promptInstall,
        dismissBanner,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
