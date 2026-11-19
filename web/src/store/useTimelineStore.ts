import { create } from 'zustand';

export type MediaAsset = {
  id: string;
  name: string;
  type: 'video' | 'audio';
  src: string;
  duration: number;
};

export type TrackItem = {
  id: string;
  mediaId: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  src: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trackIndex: number;
};

type TimelineState = {
  currentTime: number;
  isPlaying: boolean;
  mediaPool: MediaAsset[];
  items: TrackItem[];
  selectedItemId: string | null;
  disabledTracks: Record<number, boolean>;
  mutedVideoTracks: Record<number, boolean>;
  mutedAudioTracks: Record<number, boolean>;

  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  selectItem: (id: string | null) => void;
  addMedia: (media: MediaAsset) => void;
  addItem: (item: TrackItem) => void;
  updateItemStartTime: (id: string, newStartTime: number) => void;
  splitItemAtCurrentTime: () => void;
  removeSelectedItem: () => void;
  toggleDisableTrack: (trackIndex: number) => void;
  toggleMuteVideoTrack: (trackIndex: number) => void;
  toggleMuteAudioTrack: (trackIndex: number) => void;
};

export const useTimelineStore = create<TimelineState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  mediaPool: [],
  items: [],
  selectedItemId: null,
  disabledTracks: {
    0: false,
    1: false,
  },
  mutedVideoTracks: {
    0: false,
  },
  mutedAudioTracks: {
    1: false,
  },

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  selectItem: (id) => set({ selectedItemId: id }),

  addMedia: (media) =>
    set((state) => ({
      mediaPool: [...state.mediaPool, media],
    })),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      selectedItemId: item.id,
    })),

  updateItemStartTime: (id, newStartTime) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, startTime: Math.max(0, newStartTime) } : item
      ),
    })),

  toggleDisableTrack: (trackIndex) =>
    set((state) => ({
      disabledTracks: {
        ...state.disabledTracks,
        [trackIndex]: !state.disabledTracks[trackIndex],
      },
    })),

  toggleMuteVideoTrack: (trackIndex) =>
    set((state) => ({
      mutedVideoTracks: {
        ...state.mutedVideoTracks,
        [trackIndex]: !state.mutedVideoTracks[trackIndex],
      },
    })),

  toggleMuteAudioTrack: (trackIndex) =>
    set((state) => ({
      mutedAudioTracks: {
        ...state.mutedAudioTracks,
        [trackIndex]: !state.mutedAudioTracks[trackIndex],
      },
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