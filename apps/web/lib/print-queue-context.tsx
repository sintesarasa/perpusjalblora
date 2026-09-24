'use client';

import * as React from 'react';

export interface StickerItem {
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  author: string;
  categoryName?: string;
  categorySlug?: string;
  inventoryCode: string;
  copyNumber?: number;
  shelfLocation?: string | null;
  count: number; // How many copies of this sticker to print
}

interface PrintQueueContextType {
  queue: StickerItem[];
  addToQueue: (item: Omit<StickerItem, 'count'> & { count?: number }) => void;
  addMultipleToQueue: (items: (Omit<StickerItem, 'count'> & { count?: number })[]) => void;
  removeFromQueue: (inventoryCode: string) => void;
  updateCount: (inventoryCode: string, count: number) => void;
  clearQueue: () => void;
  totalCount: number;
}

const PrintQueueContext = React.createContext<PrintQueueContextType | undefined>(undefined);

const STORAGE_KEY = 'perpusjal_sticker_print_queue_v1';

export function PrintQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = React.useState<StickerItem[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setQueue(parsed);
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  React.useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      } catch {
        // Ignored
      }
    }
  }, [queue, isLoaded]);

  const addToQueue = React.useCallback(
    (item: Omit<StickerItem, 'count'> & { count?: number }) => {
      setQueue((prev) => {
        const existingIdx = prev.findIndex((i) => i.inventoryCode === item.inventoryCode);
        const addCount = item.count || 1;
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            count: updated[existingIdx].count + addCount,
          };
          return updated;
        }
        return [...prev, { ...item, count: addCount }];
      });
    },
    []
  );

  const addMultipleToQueue = React.useCallback(
    (items: (Omit<StickerItem, 'count'> & { count?: number })[]) => {
      setQueue((prev) => {
        const updated = [...prev];
        for (const item of items) {
          const idx = updated.findIndex((i) => i.inventoryCode === item.inventoryCode);
          const addCount = item.count || 1;
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              count: updated[idx].count + addCount,
            };
          } else {
            updated.push({ ...item, count: addCount });
          }
        }
        return updated;
      });
    },
    []
  );

  const removeFromQueue = React.useCallback((inventoryCode: string) => {
    setQueue((prev) => prev.filter((i) => i.inventoryCode !== inventoryCode));
  }, []);

  const updateCount = React.useCallback((inventoryCode: string, count: number) => {
    setQueue((prev) => {
      if (count <= 0) {
        return prev.filter((i) => i.inventoryCode !== inventoryCode);
      }
      return prev.map((item) =>
        item.inventoryCode === inventoryCode ? { ...item, count } : item
      );
    });
  }, []);

  const clearQueue = React.useCallback(() => {
    setQueue([]);
  }, []);

  const totalCount = queue.reduce((acc, item) => acc + (item.count || 1), 0);

  return (
    <PrintQueueContext.Provider
      value={{
        queue,
        addToQueue,
        addMultipleToQueue,
        removeFromQueue,
        updateCount,
        clearQueue,
        totalCount,
      }}
    >
      {children}
    </PrintQueueContext.Provider>
  );
}

export function usePrintQueue() {
  const context = React.useContext(PrintQueueContext);
  if (!context) {
    throw new Error('usePrintQueue must be used within a PrintQueueProvider');
  }
  return context;
}
