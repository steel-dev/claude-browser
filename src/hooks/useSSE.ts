import { useEffect, useState } from "react";

export const useSSE = (url: string | null) => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!url) return;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return data;
};
