import React from 'react';
import { OwlOverlay } from './components/Owl/OwlOverlay';

function App() {
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      
      {/* --- Actual Owl Widget (Now separated) --- */}
      <OwlOverlay />

      {/* --- Background / Content Simulation (For Demo Purposes) --- */}
      <div className="container mx-auto px-4 py-12 max-w-4xl opacity-50 select-none -z-10">
        <h1 className="text-4xl font-bold text-slate-800 mb-6">Website Content Simulation</h1>
        <p className="mb-4 text-lg text-slate-600">
            This page represents a standard website where the Owl Widget lives. 
            The Owl moves freely over this content (z-index: 9999).
        </p>
        <div className="grid grid-cols-2 gap-4">
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse delay-75"></div>
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse delay-150"></div>
            <div className="h-40 bg-slate-200 rounded-lg animate-pulse delay-200"></div>
        </div>
      </div>

      {/* --- Interactive Elements Test Zone --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200 z-0">
         <h2 className="text-xl font-bold text-slate-800 mb-4">Тест взаимодействия (Input/Button)</h2>
         <div className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Введите текст здесь..." 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            />
            <button 
              onClick={() => alert('Кнопка работает!')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg transition-colors active:scale-95"
            >
              Нажми меня
            </button>
         </div>
      </div>

    </div>
  );
}

export default App;