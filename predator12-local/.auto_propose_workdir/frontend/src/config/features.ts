export const featureFlags = {
  charts: true,
  threeDee: true,
  aiGuide: false,
  realitySim: false,
  dataOps: true
} as const;

export type FeatureKey = keyof typeof featureFlags;

export const isFeatureEnabled = (key: FeatureKey) => featureFlags[key];
