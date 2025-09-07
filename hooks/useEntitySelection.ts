"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface EntitySelection {
  kind: "talent" | "brand" | null
  id: string | null
  name: string | null
}

interface EntitySelectionStore {
  selection: EntitySelection
  setSelection: (selection: EntitySelection) => void
  clearSelection: () => void
}

export const useEntitySelection = create<EntitySelectionStore>()(
  persist(
    (set) => ({
      selection: {
        kind: null,
        id: null,
        name: null,
      },
      setSelection: (selection) => set({ selection }),
      clearSelection: () =>
        set({
          selection: { kind: null, id: null, name: null },
        }),
    }),
    {
      name: "entity-selection",
    },
  ),
)
