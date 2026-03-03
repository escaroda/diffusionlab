import React, { useState, useEffect } from 'react';
import DiffusionCanvas from './components/DiffusionCanvas';
import Controls from './components/Controls';
import { DEFAULT_PARAMS } from './constants';
import { SimulationParams } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialParams = { ...DEFAULT_PARAMS };
    
    for (const key of Object.keys(DEFAULT_PARAMS) as Array<keyof SimulationParams>) {
      if (searchParams.has(key)) {
        const value = searchParams.get(key);
        if (value !== null) {
          initialParams[key] = parseFloat(value);
        }
      }
    }
    
    return initialParams;
  });

  useEffect(() => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, value.toString());
    }
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [params]);

  const [resetSignal, setResetSignal] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [exportSignal, setExportSignal] = useState(0);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleReset = () => {
    setResetSignal(prev => prev + 1);
  };

  const handleClear = () => {
      setClearSignal(prev => prev + 1);
  };

  const handlePause = () => {
      setIsPaused(prev => !prev);
  }

  const handleExport = () => setExportSignal(prev => prev + 1);
  const handleImport = (file: File) => setImportFile(file);
  const handleImportComplete = () => setImportFile(null);
  const handleShakeStart = () => setIsShaking(true);
  const handleShakeEnd = () => setIsShaking(false);
  const handleRandomize = () => {
      setParams(p => ({
          ...p,
          feed: 0.01 + Math.random() * 0.09, // 0.01 to 0.1
          kill: 0.04 + Math.random() * 0.03, // 0.04 to 0.07
          diffA: 0.8 + Math.random() * 0.4,  // 0.8 to 1.2
          diffB: 0.3 + Math.random() * 0.4,  // 0.3 to 0.7
          colorPalette: Math.floor(Math.random() * 8), // 0 to 7
          emboss: Math.random() * 2.0,       // 0 to 2
          diversity: Math.random(),          // 0 to 1
      }));
  };

  useEffect(() => {
    if (!params.animateParams || isPaused) return;
    let animationId: number;
    let lastTime = performance.now();
    
    const loop = (time: number) => {
       const dt = time - lastTime;
       lastTime = time;
       setParams(p => {
          if (!p.animateParams) return p;
          // Drift feed and kill slightly
          const newFeed = Math.max(0.01, Math.min(0.1, p.feed + Math.sin(time * 0.001) * 0.000005 * dt));
          const newKill = Math.max(0.04, Math.min(0.07, p.kill + Math.cos(time * 0.0008) * 0.000005 * dt));
          return { ...p, feed: newFeed, kill: newKill };
       });
       animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [params.animateParams, isPaused]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      <DiffusionCanvas 
        params={params} 
        setParams={setParams}
        resetSignal={resetSignal} 
        clearSignal={clearSignal}
        isPaused={isPaused}
        exportSignal={exportSignal}
        importFile={importFile}
        onImportComplete={handleImportComplete}
        isShaking={isShaking}
      />
      <Controls 
        params={params} 
        setParams={setParams} 
        onReset={handleReset} 
        onClear={handleClear}
        onPause={handlePause}
        isPaused={isPaused}
        onExport={handleExport}
        onImport={handleImport}
        onShakeStart={handleShakeStart}
        onShakeEnd={handleShakeEnd}
        onRandomize={handleRandomize}
      />
    </div>
  );
};

export default App;
