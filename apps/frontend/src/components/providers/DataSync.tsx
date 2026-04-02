"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/stores/useMarketStore";
import { socketClient } from "@/lib/socket";

export function DataSync() {
  const { 
    commodities, 
    solarAssets, 
    fetchInitialData,
    updateLiveTick,
    selectedAssetId 
  } = useMarketStore();

  // Initial Fetch & Connect
  useEffect(() => {
    fetchInitialData();
    useMarketStore.getState().fetchHistory(selectedAssetId);
    
    socketClient.connect();

    const unsubscribe = socketClient.onTick((tick) => {
      updateLiveTick(tick);
    });

    return () => {
      unsubscribe();
      socketClient.disconnect();
    };
  }, [fetchInitialData, updateLiveTick, selectedAssetId]);

  // Handle Subscriptions whenever assets change
  useEffect(() => {
    const assetsToSubscribe = [
      ...Object.keys(commodities),
      ...Object.keys(solarAssets)
    ];
    if (assetsToSubscribe.length > 0) {
      socketClient.subscribe(assetsToSubscribe);
    }
  }, [commodities, solarAssets]);

  return null; // Silent global watcher
}
