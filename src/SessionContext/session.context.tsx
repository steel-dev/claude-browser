import React, { createContext, useContext, useState, ReactNode } from "react";

interface SessionContextProps {
  currentSession: Record<string, any> | null;
  apiKey: string;
  isSessionLoading: boolean; // renamed from isLoading
  setIsSessionLoading: (loading: boolean) => void; // renamed from setIsLoading
  startSession: () => Promise<Record<string, any>>;
  setClaudeAPIKey: (apiKey: string) => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [currentSession, setCurrentSession] = useState<Record<string, any> | null>(
    null
  );
  const [apiKey, setClaudeAPIKey] = useState<string>("");
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);

  const createSession = async () => {
    const newSession = await fetch("http://127.0.0.1:3001/new-session", {
      method: "POST",
    });
    return newSession.json();
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

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        startSession,
        apiKey,
        setClaudeAPIKey,
        isSessionLoading,
        setIsSessionLoading,
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