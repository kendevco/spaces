'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SSEContextType = {
  isConnected: boolean
}

const SSEContext = createContext<SSEContextType>({
  isConnected: false,
})

export const useSSE = () => {
  return useContext(SSEContext)
}

export const SSEProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false)

  return <SSEContext.Provider value={{ isConnected }}>{children}</SSEContext.Provider>
}
