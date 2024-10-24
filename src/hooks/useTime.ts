import { useState, useEffect } from 'react';
import { fetchTime } from '../api/timeAPI';
import { TimeData, TimeHookResult } from '../types';

const useTime = (): TimeHookResult => {
  const [time, setTime] = useState<TimeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTime = async () => {
      try {
        const data = await fetchTime();
        setTime(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    getTime();
    const interval = setInterval(getTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return { time, error };
};

export default useTime;