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
  temperature: number;
  numImagesToKeep: number;
  waitTime: number;
  setMessages: React.Dispatch<React.SetStateAction<ExtendedMessage[]>>;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsMessageLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
  setIsSystemPromptOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNumImagesToKeep: React.Dispatch<React.SetStateAction<number>>;
  setWaitTime: React.Dispatch<React.SetStateAction<number>>;
  startSession: () => Promise<Record<string, any>>;
  restartSession: () => Promise<Record<string, any>>;
  setIsSessionLoading: (loading: boolean) => void; // renamed from setIsLoading
  setClaudeAPIKey: React.Dispatch<React.SetStateAction<string>>;
  setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
  setChatHistory: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
  setIsRestartingSession: React.Dispatch<React.SetStateAction<boolean>>;
  save: ({
    prompt,
    temperature,
    numImagesToKeep,
    waitTime,
    apiKey,
  }: {
    prompt: string;
    temperature: number;
    numImagesToKeep: number;
    waitTime: number;
    apiKey: string;
  }) => void;
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
    `
You are a GODMODE browser assistant that can use tools to control a browser tab and execute all sorts tasks for a user.

<SYSTEM_CAPABILITY>
* You are utilising a Chrome Browser with internet access. It is already open and running. You can only see the current page and some times the previous few pages. 
* Your dimensions are that of the viewport of the page. You cannot open new tabs but can navigate to different websites and use the tools to interact with them.
* You are very good at using the computer tool to interact with websites. 
* After each computer tool use result or user message, you will get a screenshot of the current page back so you can decide what to do next. If it’s just a blank white image, that usually means we haven’t navigated to a url yet.
* When viewing a page it can be helpful to zoom out so that you can see everything on the page.  Either that, or make sure you scroll down to see everything before deciding something isn't available.
* When using your computer function calls, they take a while to run and send back to you.  Where possible/feasible, try to chain multiple of these calls all into one function calls request.
* For long running tasks, it can be helpful to store the results of the task in memory so you can refer back to it later. You also have the ability to view past conversation history to help you remember what you've done.
* Never hallucinate a response. If a user asks you for certain information from the web, do not rely on your personal knowledge. Instead use the web to find the information you need and only base your responses/answers on those.
* Don't let silly stuff get in your way, like pop-ups and banners. You can manually close those. You are powerful!
</SYSTEM_CAPABILITY>

<IMPORTANT>
* When conducting a search, you should use bing.com instead of google.com unless the user specifically asks for a google search.
* Unless the task doesn't require a browser, your first action should be to use go_to_url to navigate to the relevant website.
* If you come across a captcha, don't worry just try another website. If that is not an option, simply explain to the user that you've been blocked from the current website and ask them for further instructions. Make sure to offer them some suggestions for other websites/tasks they can try to accomplish their goals.
</IMPORTANT>

The current date is ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}.
`
  );
  const [chatHistory, setChatHistory] = useState<Record<string, any>[]>([]);
  const [temperature, setTemperature] = useState<number>(1.0);
  const [numImagesToKeep, setNumImagesToKeep] = useState<number>(10);
  const [waitTime, setWaitTime] = useState<number>(1);
  const [messages, setMessages] = useState<ExtendedMessage[]>(() => [
    {
      id: Date.now(),
      text: "Welcome, I'm Claude and I'll be your browsing assistant! I have full access to a browser and can help with all sorts of tasks you need.",
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
    const newSession = await fetch(
      `${process.env.REACT_APP_API_URL}/new-session`,
      {
        method: "POST",
      }
    );
    return newSession.json();
  };

  const toolResult = useSSE(
    currentSession
      ? `${process.env.REACT_APP_API_URL}/tool-results/${currentSession?.id}`
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
    await fetch(`${process.env.REACT_APP_API_URL}/release-session/${id}`);
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

  const restartSession = async () => {
    if (currentSession) {
      setIsRestartingSession(true);
      setIsSessionLoading(true);
      setMessages([
        {
          id: Date.now(),
          text: "Welcome, I'm Claude and I'll be your browsing assistant! I have full access to a browser and can help with all sorts of tasks you need.",
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
      releaseSession(currentSession.id);
      const newSession = await createSession();
      setCurrentSession(newSession);
      setIsSessionLoading(false);
      setIsRestartingSession(false);
      return newSession;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentSession?.id) {
        await releaseSession(currentSession.id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentSession]);
  const save = ({
    prompt,
    temperature,
    numImagesToKeep,
    waitTime, // in seconds
    apiKey,
  }: {
    prompt: string;
    temperature: number;
    numImagesToKeep: number;
    waitTime: number; // in seconds
    apiKey: string;
  }) => {
    console.log("Saving system prompt", prompt);
    if (prompt) setSystemPrompt(prompt);
    if (temperature) setTemperature(temperature);
    if (numImagesToKeep) setNumImagesToKeep(numImagesToKeep);
    if (waitTime) setWaitTime(waitTime * 1000); // convert to milliseconds
    if (apiKey) setClaudeAPIKey(apiKey);
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
        temperature,
        numImagesToKeep,
        waitTime,
        setNumImagesToKeep,
        setWaitTime,
        save,
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
