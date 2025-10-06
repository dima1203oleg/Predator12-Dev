import { create } from 'zustand';

export const useStore = create((set) => ({
    analysisResult: null,
    setAnalysisResult: (result) => set({ analysisResult: result }),
    isLoading: false,
    setLoading: (status) => set({ isLoading: status }),
    error: null,
    setError: (error) => set({ error }),
})); 