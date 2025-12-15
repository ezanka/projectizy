"use client"

import { createContext, useContext, useState } from "react"

const OrgRefreshContext = createContext<{
  refreshKey: number
  refresh: () => void
}>({
  refreshKey: 0,
  refresh: () => {},
})

export function OrgRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey(v => v + 1)

  return (
    <OrgRefreshContext.Provider value={{ refreshKey, refresh }}>
      {children}
    </OrgRefreshContext.Provider>
  )
}

export const useOrgRefresh = () => useContext(OrgRefreshContext)
