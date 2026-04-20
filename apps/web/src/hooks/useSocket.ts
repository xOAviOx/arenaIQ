'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

export function useSocket(autoConnect = true) {
  const connectedRef = useRef(false);

  useEffect(() => {
    if (autoConnect && !connectedRef.current) {
      connectSocket();
      connectedRef.current = true;
    }

    return () => {
      if (connectedRef.current) {
        disconnectSocket();
        connectedRef.current = false;
      }
    };
  }, [autoConnect]);

  return getSocket();
}
