import { TimeData } from "../types";

export const fetchTime = async (): Promise<TimeData> => {
  const response = await fetch(
    "http://worldtimeapi.org/api/timezone/America/Toronto"
  );
  if (!response.ok) throw new Error("Failed to fetch time");
  return response.json();
};
