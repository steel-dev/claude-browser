import { useEffect, useState } from "react";

export const useSSE = (url: string | null) => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!url) return;
    let eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      eventSource = new EventSource(url);
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return data;
};
