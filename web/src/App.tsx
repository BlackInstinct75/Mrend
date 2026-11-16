import React, { useEffect, useRef } from 'react';
import { Play, Pause, Scissors, Plus, Video, Trash2, GripVertical } from 'lucide-react';
import { useTimelineStore, type MediaAsset } from './store/useTimelineStore';

const PIXELS_PER_SECOND = 20;

export default function App() {
  const {
    currentTime,
    isPlaying,
    togglePlay,
    mediaPool,
    addMedia,
    items,
    selectedItemId,
    selectItem,
    addItem,
    splitItemAtCurrentTime,
    removeSelectedItem,
    setCurrentTime,
  } = useTimelineStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeClip = items.find(
    (item) => currentTime >= item.startTime && currentTime < item.startTime + item.duration
  );

  // Reloj de reproducción
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setCurrentTime(useTimelineStore.getState().currentTime + delta);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, setCurrentTime]);

  // Sincronización del visor <video>
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (!activeClip) {
      videoEl.pause();
      return;
    }

    if (videoEl.src !== activeClip.src) {
      videoEl.src = activeClip.src;
    }

    const targetVideoTime = activeClip.trimStart + (currentTime - activeClip.startTime);

    if (Math.abs(videoEl.currentTime - targetVideoTime) > 0.15) {
      videoEl.currentTime = targetVideoTime;
    }

    if (isPlaying && videoEl.paused) {
      videoEl.play().catch(() => {});
    } else if (!isPlaying && !videoEl.paused) {
      videoEl.pause();
    }
  }, [activeClip, currentTime, isPlaying]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        splitItemAtCurrentTime();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        removeSelectedItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, splitItemAtCurrentTime, removeSelectedItem]);

  // Importar archivos a la cajita de Medios (soporta selección múltiple)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = url;

      tempVideo.onloadedmetadata = () => {
        addMedia({
          id: crypto.randomUUID(),
          name: file.name,
          type: 'video',
          src: url,
          duration: tempVideo.duration || 5,
        });
      };
    });

    e.target.value = '';
  };

  // Añadir al final de la línea de tiempo con el botón '+' de la tarjeta
  const handleAddMediaToTimeline = (media: MediaAsset, customStartTime?: number) => {
    const currentItems = useTimelineStore.getState().items;
    const defaultStart = currentItems.reduce(
      (max, item) => Math.max(max, item.startTime + item.duration),
      0
    );

    addItem({
      id: crypto.randomUUID(),
      mediaId: media.id,
      name: media.name,
      type: 'video',
      src: media.src,
      startTime: customStartTime !== undefined ? customStartTime : defaultStart,
      duration: media.duration,
      trimStart: 0,
      trackIndex: 0,
    });
  };

  // Inicio de arrastre desde la cajita de medios
  const handleDragStart = (e: React.DragEvent, media: MediaAsset) => {
    e.dataTransfer.setData('application/json', JSON.stringify(media));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Soltar el vídeo en la pista de la línea de tiempo
  const handleDropOnTimeline = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    try {
      const media: MediaAsset = JSON.parse(rawData);
      const rect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - rect.left + e.currentTarget.scrollLeft;
      const dropTime = Math.max(0, dropX / PIXELS_PER_SECOND);

      handleAddMediaToTimeline(media, dropTime);
    } catch {
      // Ignorar si se soltó algo que no es un medio válido
    }
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-200 flex flex-col overflow-hidden font-sans select-none">
      {/* Header */}
      <header className="h-12 border-b border-neutral-800 bg-neutral-900 px-4 flex items-center justify-between">
        <h1 className="font-bold text-lg text-emerald-500 tracking-wider">VEGAS-CAP</h1>
        <div className="text-xs text-neutral-400 flex gap-3">
          <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Espacio</kbd> Play</span>
          <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">S</kbd> Cortar</span>
          <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Supr</kbd> Eliminar</span>
        </div>
      </header>

      {/* Área Superior: Medios + Visor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel Izquierdo: Biblioteca de Medios */}
        <aside className="w-80 border-r border-neutral-800 bg-neutral-900/50 flex flex-col">
          <div className="flex border-b border-neutral-800 text-sm font-medium">
            <button className="flex-1 py-2.5 border-b-2 border-emerald-500 text-emerald-400 bg-neutral-800/40">
              Medios ({mediaPool.length})
            </button>
            <button className="flex-1 py-2.5 text-neutral-400 hover:text-neutral-200">Texto</button>
            <button className="flex-1 py-2.5 text-neutral-400 hover:text-neutral-200">Efectos</button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 rounded-lg p-4 text-center hover:border-emerald-500/50 hover:bg-neutral-800/30 transition cursor-pointer shrink-0"
            >
              <Plus className="mx-auto mb-1 text-neutral-400" size={20} />
              <p className="text-xs text-neutral-300 font-medium">Importar vídeos</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Se guardarán aquí para arrastrarlos</p>
            </div>

            {/* Lista de vídeos importados en la cajita */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {mediaPool.map((media) => (
                <div
                  key={media.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, media)}
                  className="group relative bg-neutral-900 border border-neutral-800 hover:border-emerald-500/60 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing flex flex-col"
                >
                  {/* Miniatura de vídeo (primer fotograma) */}
                  <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                    <video
                      src={`${media.src}#t=0.5`}
                      className="w-full h-full object-cover pointer-events-none"
                      preload="metadata"
                      muted
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono px-1 rounded text-neutral-300">
                      {media.duration.toFixed(1)}s
                    </span>
                    {/* Botón rápido '+' estilo CapCut */}
                    <button
                      onClick={() => handleAddMediaToTimeline(media)}
                      title="Añadir a la línea de tiempo"
                      className="absolute top-1 right-1 bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Nombre del archivo */}
                  <div className="p-1.5 flex items-center gap-1 text-[11px] text-neutral-300 bg-neutral-900">
                    <GripVertical size={12} className="text-neutral-600 shrink-0" />
                    <span className="truncate" title={media.name}>{media.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Reproductor Central */}
        <main className="flex-1 bg-black flex flex-col items-center justify-center relative p-4">
          <div className="w-full max-w-3xl aspect-video bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center relative shadow-2xl overflow-hidden">
            <video
              ref={videoRef}
              className={`w-full h-full object-contain ${activeClip ? 'block' : 'hidden'}`}
              playsInline
            />
            {!activeClip && (
              <span className="text-neutral-600 text-sm">
                Arrastra un vídeo desde Medios hacia la línea de tiempo
              </span>
            )}
            <div className="absolute bottom-3 right-3 bg-neutral-950/80 px-2 py-1 rounded text-xs font-mono">
              {currentTime.toFixed(2)}s
            </div>
          </div>
        </main>
      </div>

      {/* Área Inferior: Línea de Tiempo */}
      <footer className="h-72 border-t border-neutral-800 bg-neutral-900 flex flex-col">
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
            <button
              onClick={removeSelectedItem}
              disabled={!selectedItemId}
              title="Eliminar seleccionado (Supr)"
              className="p-1.5 hover:bg-neutral-800 disabled:opacity-30 rounded text-red-400 transition flex items-center gap-1 text-xs"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="font-mono text-xs text-emerald-400">
            00:00:{currentTime.toFixed(1).padStart(4, '0')}
          </div>
        </div>

        {/* Zona de Pistas (Acepta Drop desde Medios) */}
        <div
          className="flex-1 overflow-x-auto relative p-4 bg-neutral-950/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnTimeline}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left - 16 + e.currentTarget.scrollLeft;
            setCurrentTime(Math.max(0, clickX / PIXELS_PER_SECOND));
          }}
        >
          {/* Aguja de Reproducción */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ left: `${currentTime * PIXELS_PER_SECOND + 16}px` }}
          >
            <div className="w-3 h-3 bg-red-500 -translate-x-1/2 rotate-45 -mt-1.5" />
          </div>

          <div className="flex flex-col gap-2 relative z-10 min-w-full">
            <div className="h-16 bg-neutral-900/90 border border-dashed border-neutral-800 rounded relative flex items-center">
              {items.length === 0 && (
                <span className="text-xs text-neutral-600 mx-auto pointer-events-none">
                  Suelta aquí tus vídeos para empezar a editar
                </span>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectItem(item.id);
                  }}
                  className={`absolute h-12 top-2 rounded px-3 flex items-center justify-between text-xs cursor-pointer border transition ${
                    selectedItemId === item.id
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                  }`}
                  style={{
                    left: `${item.startTime * PIXELS_PER_SECOND}px`,
                    width: `${item.duration * PIXELS_PER_SECOND}px`,
                  }}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <Video size={14} className="shrink-0" /> {item.name}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono ml-2">
                    {item.duration.toFixed(1)}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}