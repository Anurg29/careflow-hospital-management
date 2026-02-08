import { useEffect, useRef, useState } from 'react';

function inferWsBase() {
  if (import.meta.env.VITE_WS_BASE) return import.meta.env.VITE_WS_BASE;
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;
    const scheme = protocol === 'https:' ? 'wss' : 'ws';
    return `${scheme}://${host}`;
  }
  const api = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  return api.replace('http', 'ws');
}

export function useHospitalSocket(hospitalId, { onMessage, onStatus }) {
  const [state, setState] = useState('idle');
  const wsRef = useRef(null);

  useEffect(() => {
    if (!hospitalId) return undefined;
    const wsBase = inferWsBase();
    const url = `${wsBase}/ws/hospitals/${hospitalId}/`;
    setState('connecting');
    onStatus?.('connecting');
    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      setState('open');
      onStatus?.('open');
    };

    socket.onclose = () => {
      setState('closed');
      onStatus?.('closed');
    };

    socket.onerror = () => {
      setState('error');
      onStatus?.('error');
    };

    socket.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        onMessage?.(payload);
      } catch (err) {
        // ignore parse errors
      }
    };

    return () => {
      socket.close(1000, 'component unmounted');
    };
  }, [hospitalId, onMessage, onStatus]);

  const sendRefresh = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }));
    }
  };

  return { status: state, refresh: sendRefresh };
}
