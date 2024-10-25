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

  // Define the Message interface with additional fields
  export interface ExtendedMessage {
    id: number;
    text: string;
    timestamp: Date;
    role: 'user' | 'assistant' | 'system' | 'error';  // Added system and error
    isStreaming?: boolean;
    contentType?: 'text' | 'tool_use' | 'system' | 'error';  // Added system and error
    contentIndex?: number;
    partialInput?: string;
    name?: string;
  }