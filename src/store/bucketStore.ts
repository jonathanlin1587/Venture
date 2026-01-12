import { create } from 'zustand';
import { Bucket, Goal } from '../types';
import {
  subscribeToUserBuckets,
  subscribeToBucketGoals,
} from '../services/bucketService';

interface BucketState {
  buckets: Bucket[];
  goals: Record<string, Goal[]>; // bucketId -> goals
  loading: boolean;
  error: string | null;
  unsubscribeBuckets: (() => void) | null;
  unsubscribeGoals: Record<string, (() => void)>; // bucketId -> unsubscribe function

  // Actions
  setBuckets: (buckets: Bucket[]) => void;
  setBucketGoals: (bucketId: string, goals: Goal[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  subscribeToBuckets: (userId: string) => void;
  subscribeToGoals: (bucketId: string) => void;
  unsubscribeFromBuckets: () => void;
  unsubscribeFromGoals: (bucketId: string) => void;
  clearState: () => void;
}

export const useBucketStore = create<BucketState>((set, get) => ({
  buckets: [],
  goals: {},
  loading: true,
  error: null,
  unsubscribeBuckets: null,
  unsubscribeGoals: {},

  setBuckets: (buckets) => set({ buckets }),
  setBucketGoals: (bucketId, goals) =>
    set((state) => ({
      goals: { ...state.goals, [bucketId]: goals },
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  subscribeToBuckets: (userId) => {
    // Unsubscribe from previous subscription if exists
    const currentUnsubscribe = get().unsubscribeBuckets;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const unsubscribe = subscribeToUserBuckets(userId, (buckets) => {
      set({ buckets, loading: false, error: null });
    });

    set({ unsubscribeBuckets: unsubscribe, loading: true });
  },

  subscribeToGoals: (bucketId) => {
    // Unsubscribe from previous subscription if exists
    const currentUnsubscribe = get().unsubscribeGoals[bucketId];
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const unsubscribe = subscribeToBucketGoals(bucketId, (goals) => {
      get().setBucketGoals(bucketId, goals);
    });

    set((state) => ({
      unsubscribeGoals: { ...state.unsubscribeGoals, [bucketId]: unsubscribe },
    }));
  },

  unsubscribeFromBuckets: () => {
    const unsubscribe = get().unsubscribeBuckets;
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribeBuckets: null });
    }
  },

  unsubscribeFromGoals: (bucketId) => {
    const unsubscribe = get().unsubscribeGoals[bucketId];
    if (unsubscribe) {
      unsubscribe();
      set((state) => {
        const newUnsubscribeGoals = { ...state.unsubscribeGoals };
        delete newUnsubscribeGoals[bucketId];
        return { unsubscribeGoals: newUnsubscribeGoals };
      });
    }
  },

  clearState: () => {
    // Unsubscribe from all
    get().unsubscribeFromBuckets();
    Object.keys(get().unsubscribeGoals).forEach((bucketId) => {
      get().unsubscribeFromGoals(bucketId);
    });

    set({
      buckets: [],
      goals: {},
      loading: false,
      error: null,
      unsubscribeBuckets: null,
      unsubscribeGoals: {},
    });
  },
}));

