'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { useConfig } from '@/components/ConfigProvider';

const Hero3D = dynamic(() => import('@/components/v2/Hero3D').then(mod => mod.Hero3D), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-zinc-900/10 dark:bg-zinc-100/5 rounded-full blur-3xl opacity-20" />
});

const FullTerminal = dynamic(() => import('@/components/v2/FullTerminal').then(mod => mod.FullTerminal), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex flex-col p-4 sm:p-8 font-mono text-sm">
      <div className="flex-1 space-y-2 animate-pulse">
        <div className="h-4 w-48 bg-zinc-800 rounded"></div>
        <div className="h-4 w-72 bg-zinc-900 rounded"></div>
        <div className="h-4 w-32 bg-zinc-800 rounded"></div>
      </div>
      <div className="h-6 w-full bg-zinc-900 mt-4 rounded"></div>
    </div>
  )
});

export default function Home() {
  const [lang, setLang] = useState<'EN' | 'DE' | 'UA'>('EN');
  const [isMounted, setIsMounted] = useState(false);
  const { config } = useConfig();

  useEffect(() => {
    // 1. Check localStorage first
    const savedLang = localStorage.getItem('preferred-language') as 'EN' | 'DE' | 'UA' | null;

    if (savedLang && ['EN', 'DE', 'UA'].includes(savedLang)) {
      setLang(savedLang);
    } else {
      // 2. Fallback to browser detection
      const browserLang = navigator.language.split('-')[0].toUpperCase();
      let initialLang: 'EN' | 'DE' | 'UA' = 'EN';

      if (browserLang === 'DE') initialLang = 'DE';
      else if (browserLang === 'UK' || browserLang === 'UA') initialLang = 'UA';

      setLang(initialLang);
      localStorage.setItem('preferred-language', initialLang);
    }

    setIsMounted(true);
  }, []);

  const handleLanguageChange = (newLang: 'EN' | 'DE' | 'UA') => {
    setLang(newLang);
    localStorage.setItem('preferred-language', newLang);
  };

  useEffect(() => {
    if (isMounted) {
      (window as any).changeLanguage = handleLanguageChange;
    }
  }, [isMounted]);

  return (
    <main className="min-h-screen bg-black relative overflow-hidden selection:bg-[var(--accent)] selection:text-black">
      {/* 3D Background - controlled by config, unmounted during heavy effects to save performance */}
      {config.ui.show3DBackground && !config.ui.showMatrixEffect && !config.ui.showPipesEffect && (
        <div className={`absolute inset-0 opacity-30 pointer-events-none z-0 transition-opacity duration-1000 ${isMounted ? 'opacity-30' : 'opacity-0'}`}>
          <Hero3D />
        </div>
      )}

      {/* Terminal */}
      <FullTerminal />
    </main>
  );
}
