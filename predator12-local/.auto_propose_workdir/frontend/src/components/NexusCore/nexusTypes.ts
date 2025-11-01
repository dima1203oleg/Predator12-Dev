// @ts-nocheck
import React from 'react';

export type NexusModule =
  | 'dashboard'
  | 'ai-supervision'
  | 'dataops'
  | 'chrono-spatial'
  | 'reality-simulator'
  | 'opensearch'
  | 'admin'
  | 'security';

export interface NexusMenuItem {
  id: NexusModule;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}
