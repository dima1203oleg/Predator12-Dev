import { create } from 'zustand';

const useSimulationStore = create((set) => ({
  selectedRegion: '',
  setSelectedRegion: (regionId) => set({ selectedRegion: regionId }),
}));

export default useSimulationStore; 