import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSSE } from "../hooks/useSSE";
import { ExtendedMessage } from "../types";

interface SessionContextProps {
  currentSession: Record<string, any> | null;
  apiKey: string;
  isSessionLoading: boolean; // renamed from isLoading
  isRestartingSession: boolean;
  systemPrompt: string;
  chatHistory: Record<string, any>[];
  messages: ExtendedMessage[];
  newMessage: string;
  isMessageLoading: boolean;
  timer: number;
  isSystemPromptOpen: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ExtendedMessage[]>>;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsMessageLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
  setIsSystemPromptOpen: React.Dispatch<React.SetStateAction<boolean>>;
  startSession: () => Promise<Record<string, any>>;
  restartSession: (id: string) => Promise<Record<string, any>>;
  setIsSessionLoading: (loading: boolean) => void; // renamed from setIsLoading
  setClaudeAPIKey: React.Dispatch<React.SetStateAction<string>>;
  setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
  setChatHistory: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
  setIsRestartingSession: React.Dispatch<React.SetStateAction<boolean>>;
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<Record<
    string,
    any
  > | null>(null);
  const [apiKey, setClaudeAPIKey] = useState<string>("");
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);
  const [isRestartingSession, setIsRestartingSession] =
    useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    `You are Claude, an AI assistant. You are controlling a browser in the cloud using steel.dev's browser API. You can help users by browsing the web and performing tasks for them.`
  );
  const [chatHistory, setChatHistory] = useState<Record<string, any>[]>([]);
  const [messages, setMessages] = useState<ExtendedMessage[]>(() => [
    {
      id: Date.now(),
      text: "Welcome to Claude! I'm here to help you with any questions or tasks you have.",
      timestamp: new Date(),
      role: "system",
      contentType: "system",
    },
  ]);
  const [newMessage, setNewMessage] = useState<string>("");
  // const { setIsSessionLoading, startSession } = useSession();
  const [isMessageLoading, setIsMessageLoading] = useState(false); // This is for message loading
  const [timer, setTimer] = useState<number>(0);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);

  const createSession = async () => {
    const newSession = await fetch("http://127.0.0.1:3001/new-session", {
      method: "POST",
    });
    return newSession.json();
  };

  const toolResult = useSSE(
    currentSession
      ? `http://127.0.0.1:3001/tool-results/${currentSession?.id}`
      : null
  );

  useEffect(() => {
    if (toolResult) {
      setChatHistory((prev) => [...prev, toolResult]);
    }
  }, [toolResult]);

  useEffect(() => {
    console.log(chatHistory);
  }, [chatHistory]);

  const releaseSession = async (id: string) => {
    await fetch(`http://127.0.0.1:3001/release-session/${id}`);
  };

  const startSession = async () => {
    setIsSessionLoading(true);
    try {
      const newSession = await createSession();
      setCurrentSession(newSession);
      return newSession;
    } finally {
      setIsSessionLoading(false);
    }
  };

  const restartSession = async (id: string) => {
    setIsRestartingSession(true);
    setIsSessionLoading(true);
    setMessages([
      {
        id: Date.now(),
        text: "Welcome to Claude! I'm here to help you with any questions or tasks you have.",
        timestamp: new Date(),
        role: "system",
        contentType: "system",
      },
    ]);
    setNewMessage("");
    setTimer(0);
    setIsSystemPromptOpen(false);
    setIsMessageLoading(false);
    setChatHistory([]);
    releaseSession(id);
    const newSession = await createSession();
    setCurrentSession(newSession);
    setIsSessionLoading(false);
    setIsRestartingSession(false);
    return newSession;
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        startSession,
        apiKey,
        setClaudeAPIKey,
        isSessionLoading,
        setIsSessionLoading,
        restartSession,
        systemPrompt,
        setSystemPrompt,
        chatHistory,
        setChatHistory,
        isRestartingSession,
        setIsRestartingSession,
        messages,
        setMessages,
        newMessage,
        setNewMessage,
        isMessageLoading,
        setIsMessageLoading,
        timer,
        setTimer,
        isSystemPromptOpen,
        setIsSystemPromptOpen,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
