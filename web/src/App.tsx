import React, { useEffect } from 'react';
import { Play, Pause, Scissors, Plus, Video, Music, Type } from 'lucide-react';
import { useTimelineStore } from './store/useTimelineStore';

export default function App() {
  const { 
    currentTime, 
    isPlaying, 
    togglePlay, 
    items, 
    selectedItemId, 
    selectItem, 
    splitItemAtCurrentTime,
    setCurrentTime 
  } = useTimelineStore();

  // Escuchar atajos de teclado al estilo Sony Vegas ('S' para dividir, Espacio para play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        splitItemAtCurrentTime();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, splitItemAtCurrentTime]);

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-200 flex flex-col overflow-hidden font-sans select-none">
      
      {/* 1. Header / Barra superior */}
      <header className="h-12 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between">
        <h1 className="font-bold text-lg text-emerald-500 tracking-wider">VEGAS-CAP</h1>
        <div className="text-xs text-neutral-400">
          Atajos: <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Espacio</kbd> Play/Pausa | <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">S</kbd> Dividir
        </div>
      </header>

      {/* 2. Área Superior: Medios + Visor (CapCut Style) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel Izquierdo: Recursos / Efectos */}
        <aside className="w-80 border-r border-neutral-800 bg-neutral-900/50 flex flex-col">
          <div className="flex border-b border-neutral-800 text-sm font-medium">
            <button className="flex-1 py-2.5 border-b-2 border-emerald-500 text-emerald-400 bg-neutral-800/40">Medios</button>
            <button className="flex-1 py-2.5 text-neutral-400 hover:text-neutral-200">Texto</button>
            <button className="flex-1 py-2.5 text-neutral-400 hover:text-neutral-200">Efectos</button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-emerald-500/50 transition cursor-pointer">
              <Plus className="mx-auto mb-2 text-neutral-400" size={24} />
              <p className="text-xs text-neutral-400">Arrastra archivos aquí o haz clic para importar</p>
            </div>
          </div>
        </aside>

        {/* Reproductor / Preview Central */}
        <main className="flex-1 bg-black flex flex-col items-center justify-center relative p-4">
          <div className="w-full max-w-3xl aspect-video bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center relative shadow-2xl overflow-hidden">
            <span className="text-neutral-600 text-sm">Previsualización de Vídeo (Canvas)</span>
            {/* Tiempo actual arriba del visor */}
            <div className="absolute bottom-3 right-3 bg-neutral-950/80 px-2 py-1 rounded text-xs font-mono">
              {currentTime.toFixed(2)}s
            </div>
          </div>
        </main>
      </div>

      {/* 3. Área Inferior: Línea de Tiempo (Sony Vegas Style) */}
      <footer className="h-72 border-t border-neutral-800 bg-neutral-900 flex flex-col">
        
        {/* Controles de reproducción */}
        <div className="h-10 border-b border-neutral-800 px-4 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlay}
              className="p-1.5 hover:bg-neutral-800 rounded text-neutral-200 transition"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button 
              onClick={splitItemAtCurrentTime}
              title="Dividir clip (S)"
              className="p-1.5 hover:bg-neutral-800 rounded text-neutral-200 transition flex items-center gap-1 text-xs"
            >
              <Scissors size={16} /> Dividir
            </button>
          </div>
          <div className="font-mono text-xs text-emerald-400">
            00:00:{currentTime.toFixed(1).padStart(4, '0')}
          </div>
        </div>

        {/* Contenedor de Pistas / Timeline Scrollable */}
        <div 
          className="flex-1 overflow-x-auto relative p-4 bg-neutral-950/50"
          onClick={(e) => {
            // Mover la aguja al hacer clic en el fondo de la línea de tiempo
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            setCurrentTime(clickX / 20); // 20px por segundo de zoom base
          }}
        >
          {/* Aguja de Reproducción (Playhead) */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ left: `${currentTime * 20 + 16}px` }}
          >
            <div className="w-3 h-3 bg-red-500 -translate-x-1/2 rotate-45 -mt-1.5" />
          </div>

          {/* Pistas multipista */}
          <div className="flex flex-col gap-2 relative z-10">
            {/* Pista 1 */}
            <div className="h-14 bg-neutral-900 border border-neutral-800 rounded relative overflow-hidden flex items-center">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectItem(item.id);
                  }}
                  className={`absolute h-10 top-2 rounded px-3 flex items-center justify-between text-xs cursor-pointer border transition ${
                    selectedItemId === item.id
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                  }`}
                  style={{
                    left: `${item.startTime * 20}px`,
                    width: `${item.duration * 20}px`,
                  }}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <Video size={14} /> {item.name}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">{item.duration.toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}