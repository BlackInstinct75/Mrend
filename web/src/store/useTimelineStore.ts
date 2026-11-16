import { create } from 'zustand';

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio';
  src: string;
  duration: number;
}

export interface TrackItem {
  id: string;
  mediaId: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  src: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trackIndex: number;
}

interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  mediaPool: MediaAsset[];
  items: TrackItem[];
  selectedItemId: string | null;

  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  selectItem: (id: string | null) => void;
  addMedia: (media: MediaAsset) => void;
  addItem: (item: TrackItem) => void;
  updateItemStartTime: (id: string, newStartTime: number) => void;
  splitItemAtCurrentTime: () => void;
  removeSelectedItem: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  mediaPool: [],
  items: [],
  selectedItemId: null,

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  selectItem: (id) => set({ selectedItemId: id }),

  addMedia: (media) => set((state) => ({
    mediaPool: [...state.mediaPool, media],
  })),

  addItem: (item) => set((state) => ({
    items: [...state.items, item],
    selectedItemId: item.id,
  })),

  updateItemStartTime: (id, newStartTime) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, startTime: Math.max(0, newStartTime) } : item
    ),
  })),

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

    const firstHalf: TrackItem = {
      ...itemToSplit,
      duration: splitOffset,
    };

    const secondHalf: TrackItem = {
      ...itemToSplit,
      id: crypto.randomUUID(),
      name: `${itemToSplit.name} (2)`,
      startTime: currentTime,
      duration: itemToSplit.duration - splitOffset,
      trimStart: itemToSplit.trimStart + splitOffset,
    };

    set({
      items: items.flatMap((item) =>
        item.id === itemToSplit.id ? [firstHalf, secondHalf] : [item]
      ),
      selectedItemId: secondHalf.id,
    });
  },

  removeSelectedItem: () => {
    const { items, selectedItemId } = get();
    if (!selectedItemId) return;
    set({
      items: items.filter((item) => item.id !== selectedItemId),
      selectedItemId: null,
    });
  },
}));