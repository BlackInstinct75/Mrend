import { create } from 'zustand';

export interface TrackItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  src: string;
  startTime: number; // En segundos
  duration: number;  // En segundos
  trackIndex: number; // Capa/Pista (0, 1, 2...)
}

interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
  items: TrackItem[];
  selectedItemId: string | null;
  
  // Acciones
  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  selectItem: (id: string | null) => void;
  addItem: (item: TrackItem) => void;
  splitItemAtCurrentTime: () => void; // El mítico 'S' de Sony Vegas
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  zoom: 10, // Pixeles por segundo
  selectedItemId: null,
  items: [
    {
      id: 'demo-1',
      name: 'Clip_Ejemplo.mp4',
      type: 'video',
      src: '',
      startTime: 0,
      duration: 8,
      trackIndex: 0,
    },
  ],

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  selectItem: (id) => set({ selectedItemId: id }),
  
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),

  // Acción para dividir el clip bajo el cabezal de reproducción (Atajo 'S')
  splitItemAtCurrentTime: () => {
    const { items, currentTime, selectedItemId } = get();
    const itemToSplit = items.find(
      (item) =>
        (selectedItemId ? item.id === selectedItemId : true) &&
        currentTime > item.startTime &&
        currentTime < item.startTime + item.duration
    );

    if (!itemToSplit) return;

    const splitOffset = currentTime - itemToSplit.startTime;
    const firstHalfDuration = splitOffset;
    const secondHalfDuration = itemToSplit.duration - splitOffset;

    const updatedItem: TrackItem = {
      ...itemToSplit,
      duration: firstHalfDuration,
    };

    const newItem: TrackItem = {
      ...itemToSplit,
      id: crypto.randomUUID(),
      name: `${itemToSplit.name} (Copia)`,
      startTime: currentTime,
      duration: secondHalfDuration,
    };

    set({
      items: items.flatMap((item) =>
        item.id === itemToSplit.id ? [updatedItem, newItem] : [item]
      ),
      selectedItemId: newItem.id,
    });
  },
}));