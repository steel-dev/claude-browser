export interface TimeData {
    datetime: string;
    timezone: string;
    [key: string]: any;
  }
  
  export interface TimeHookResult {
    time: TimeData | null;
    error: string | null;
  }
  
  export interface Message {
    id: number;
    text: string;
    timestamp: Date;
  }

  export interface Message {
    id: number;
    text: string;
    timestamp: Date;
    role: 'user' | 'assistant';
    isStreaming?: boolean;
  }