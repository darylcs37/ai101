import { useEffect } from 'react';
import { useWarehouseStore } from '../store/warehouseStore';

export const LIVE_INTERVAL_MS = 2_000;

/**
 * Starts a single simulation timer. Returns a stop function.
 * Pauses automatically while the tab is hidden so the simulated clock does not jump.
 */
export function startLiveUpdates(intervalMs = LIVE_INTERVAL_MS): () => void {
  const id = window.setInterval(() => {
    const { running, advance } = useWarehouseStore.getState();
    if (running && document.visibilityState === 'visible') advance();
  }, intervalMs);
  return () => window.clearInterval(id);
}

export function useLiveUpdates(intervalMs = LIVE_INTERVAL_MS): void {
  useEffect(() => startLiveUpdates(intervalMs), [intervalMs]);
}
