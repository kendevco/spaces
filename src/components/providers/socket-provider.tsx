"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    lastActivity: number;
    updateLastActivity: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    lastActivity: Date.now(),
    updateLastActivity: () => { }
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());

    const updateLastActivity = () => {
        setLastActivity(Date.now());
    };

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL!, {
            path: "/api/socket/io",
            addTrailingSlash: false,
            transports: ["polling", "websocket"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            withCredentials: true,
        });

        socketInstance.on("connect", () => {
            console.log("[SOCKET] Connected", socketInstance.id);
            setIsConnected(true);
            updateLastActivity();
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("[SOCKET] Disconnected:", reason);
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (error) => {
            console.log("[SOCKET] Connection error:", error);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, lastActivity, updateLastActivity }}>
            {children}
        </SocketContext.Provider>
    );
};
