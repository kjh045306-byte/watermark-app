import { useState, useEffect } from 'react'

function getPlatformInfo() {
  const ua = navigator.userAgent
  // iOS: iPhone/iPad/iPod에서 Chrome·Firefox·Edge 제외 (순수 Safari만)
  const isIos =
    /iphone|ipad|ipod/i.test(ua) &&
    !/crios|fxios|edgios/i.test(ua) &&
    !('MSStream' in window)
  const isStandalone =
    (typeof navigator.standalone === 'boolean' && navigator.standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
  return { isIos, isStandalone }
}

export function usePwaInstall() {
  const { isIos, isStandalone } = getPlatformInfo()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    if (isStandalone) return

    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const promptInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setDeferredPrompt(null)
    }
  }

  return {
    canInstall: !!deferredPrompt && !installed, // Chrome / Edge / Android
    showIosGuide: isIos && !isStandalone,       // iOS Safari — 수동 안내 필요
    installed,
    promptInstall,
  }
}
