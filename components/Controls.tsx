import React, { useState } from 'react';
import { SimulationParams, Preset } from '../types';
import { PRESETS } from '../constants';

interface ControlsProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  onReset: () => void;
  onClear: () => void;
  onPause: () => void;
  isPaused: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onRandomize: () => void;
  onShakeStart: () => void;
  onShakeEnd: () => void;
  onSaveImage: () => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  tooltip?: string;
}> = ({ label, value, min, max, step, onChange, tooltip }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider" title={tooltip}>
        {label}
      </label>
      <span className="text-xs text-blue-400 font-mono">{value.toFixed(4)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    />
  </div>
);

const Controls: React.FC<ControlsProps> = ({ params, setParams, onReset, onClear, onPause, isPaused, onExport, onImport, onRandomize, onShakeStart, onShakeEnd, onSaveImage }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = PRESETS.find(p => p.name === e.target.value);
    if (preset) {
      setParams(prev => ({ ...prev, ...preset.params }));
    }
  };

  return (
    <div className={`fixed top-4 right-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl text-white z-50 transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide ${isMinimized ? 'p-3' : 'w-72 p-5'}`}>
      <div className={`flex justify-end items-center ${isMinimized ? '' : 'mb-4 justify-between'}`}>
        {!isMinimized && (
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Diffusion Lab
          </h1>
        )}
        <button 
          onClick={() => setIsMinimized(!isMinimized)} 
          className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors" 
          title={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          )}
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="mb-4">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                 <button 
                  onClick={onRandomize}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-900/50 hover:bg-emerald-800/50 rounded-lg transition-colors text-emerald-300 text-xs font-semibold w-full"
                  title="I Feel Lucky (Random Parameters)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Lucky
                </button>
                <button 
                  onClick={onSaveImage}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pink-900/50 hover:bg-pink-800/50 rounded-lg transition-colors text-pink-300 text-xs font-semibold w-full"
                  title="Save Image"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Save Image
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button 
                  onClick={onExport}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-900/50 hover:bg-blue-800/50 rounded-lg transition-colors text-blue-300 text-xs font-semibold"
              title="Export State"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export State
            </button>
            <label 
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-900/50 hover:bg-purple-800/50 rounded-lg transition-colors text-purple-300 cursor-pointer text-xs font-semibold"
              title="Import State"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import State
              <input 
                type="file" 
                accept=".rdd" 
                className="hidden" 
                onChange={(e) => { 
                  if (e.target.files?.[0]) onImport(e.target.files[0]); 
                  e.target.value = ''; 
                }} 
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
             <button 
              onClick={onPause}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${isPaused ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
             <button 
              onClick={onReset}
              className="flex items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Reset Grid"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button 
              onClick={onClear}
              className="flex items-center justify-center p-2 bg-red-900/50 hover:bg-red-800/50 rounded-lg transition-colors text-red-300"
              title="Clear All"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Presets</label>
        <select 
          onChange={handlePresetChange} 
          className="w-full bg-gray-800 text-sm border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {PRESETS.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Color Palette</label>
        <select 
          value={params.colorPalette}
          onChange={(e) => setParams(p => ({ ...p, colorPalette: parseInt(e.target.value) }))} 
          className="w-full bg-gray-800 text-sm border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value={0}>Electric Blue</option>
          <option value={1}>Magma</option>
          <option value={2}>Neon Green</option>
          <option value={3}>Gold</option>
          <option value={4}>Iridescent</option>
          <option value={5}>Silver</option>
          <option value={6}>Bronze</option>
          <option value={7}>Patina</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase">Reaction Rates</h2>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase cursor-pointer hover:text-blue-300 transition-colors">
              <input 
                type="checkbox" 
                checked={params.animateParams} 
                onChange={(e) => setParams(p => ({ ...p, animateParams: e.target.checked }))}
                className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 w-3 h-3"
              />
              Animate
            </label>
          </div>
          <Slider 
            label="Feed Rate (f)" 
            value={params.feed} 
            min={0.005} 
            max={0.1} 
            step={0.0001} 
            onChange={(v) => setParams(p => ({ ...p, feed: v }))} 
            tooltip="Rate at which chemical A is added"
          />
          <Slider 
            label="Kill Rate (k)" 
            value={params.kill} 
            min={0.02} 
            max={0.1} 
            step={0.0001} 
            onChange={(v) => setParams(p => ({ ...p, kill: v }))}
            tooltip="Rate at which chemical B is removed" 
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase">Diffusion</h2>
          <Slider 
            label="Diff Rate A" 
            value={params.diffA} 
            min={0.0} 
            max={1.2} 
            step={0.01} 
            onChange={(v) => setParams(p => ({ ...p, diffA: v }))} 
          />
           <Slider 
            label="Diff Rate B" 
            value={params.diffB} 
            min={0.0} 
            max={1.2} 
            step={0.01} 
            onChange={(v) => setParams(p => ({ ...p, diffB: v }))} 
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase">Visuals</h2>
          <Slider 
            label="3D Emboss" 
            value={params.emboss} 
            min={0.0} 
            max={3.0} 
            step={0.1} 
            onChange={(v) => setParams(p => ({ ...p, emboss: v }))} 
            tooltip="Intensity of the 3D lighting effect"
          />
          <Slider 
            label="Diversity" 
            value={params.diversity} 
            min={0.0} 
            max={1.0} 
            step={0.01} 
            onChange={(v) => setParams(p => ({ ...p, diversity: v }))} 
            tooltip="Spatial variation in feed/kill rates"
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase">3D Light</h2>
          <Slider 
            label="Light X" 
            value={params.lightX} 
            min={-5.0} 
            max={5.0} 
            step={0.1} 
            onChange={(v) => setParams(p => ({ ...p, lightX: v }))} 
          />
          <Slider 
            label="Light Y" 
            value={params.lightY} 
            min={-5.0} 
            max={5.0} 
            step={0.1} 
            onChange={(v) => setParams(p => ({ ...p, lightY: v }))} 
          />
          <Slider 
            label="Light Z" 
            value={params.lightZ} 
            min={0.1} 
            max={5.0} 
            step={0.1} 
            onChange={(v) => setParams(p => ({ ...p, lightZ: v }))} 
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase">Simulation</h2>
           <Slider 
            label="Animation Speed" 
            value={params.animationSpeed} 
            min={0.1} 
            max={20.0} 
            step={0.1} 
            onChange={(v) => setParams(p => ({ ...p, animationSpeed: v }))} 
            tooltip="Simulation speed. Lower values create slow-motion effects."
          />
           <Slider 
            label="Brush Size" 
            value={params.brushSize} 
            min={1} 
            max={100} 
            step={1} 
            onChange={(v) => setParams(p => ({ ...p, brushSize: v }))} 
          />
        </div>
        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase">Environment</h2>
          <Slider 
            label="Shake Strength" 
            value={params.shakeStrength} 
            min={0.0} 
            max={1.0} 
            step={0.01} 
            onChange={(v) => setParams(p => ({ ...p, shakeStrength: v }))} 
          />
          <button 
            onMouseDown={onShakeStart}
            onMouseUp={onShakeEnd}
            onMouseLeave={onShakeEnd}
            onTouchStart={onShakeStart}
            onTouchEnd={onShakeEnd}
            className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-900/50 hover:bg-orange-800/50 rounded-lg transition-colors text-orange-300 text-xs font-semibold w-full select-none"
            title="Hold to Shake Surface"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Hold to Shake
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-[10px] text-gray-500 text-center space-y-2">
        <div className="space-y-1">
          <p>Click and drag to add chemical B.</p>
          <p>Hold <kbd className="bg-gray-800 px-1 rounded">Shift</kbd> + Drag to pan.</p>
        </div>
        <div className="pt-2 border-t border-gray-800 flex flex-col items-center gap-2">
          <a 
            href="https://github.com/escaroda/diffusionlab" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            escaroda/diffusionlab
          </a>
          <a 
            href="https://www.instagram.com/callsomeoneyoulove/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @callsomeoneyoulove
          </a>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Controls;
