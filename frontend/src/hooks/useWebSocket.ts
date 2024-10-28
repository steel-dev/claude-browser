import { useEffect, useState } from "react";

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return data;
};
