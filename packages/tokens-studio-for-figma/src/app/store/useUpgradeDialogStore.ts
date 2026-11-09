import { create } from 'zustand';
import type { UpgradeFeature } from '@/app/components/UpgradeDialog/upgradeFeatures';

interface UpgradeDialogState {
  feature: UpgradeFeature | null;
  source: string | null;
  openUpgradeDialog: (feature: UpgradeFeature, source?: string) => void;
  closeUpgradeDialog: () => void;
}

/**
 * A single upgrade dialog is mounted in AppContainer; entry points (often inside dropdown menus that unmount on
 * select) open it through this store instead of rendering their own modal.
 */
export const useUpgradeDialogStore = create<UpgradeDialogState>((set) => ({
  feature: null,
  source: null,
  openUpgradeDialog: (feature, source) => set({ feature, source: source ?? null }),
  closeUpgradeDialog: () => set({ feature: null, source: null }),
}));
