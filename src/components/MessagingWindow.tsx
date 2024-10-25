import React, { useEffect, useState, useRef } from "react";
import { Window, Button } from "react-windows-xp";
import { Message } from "../types";
import { useSession } from "../SessionContext/session.context";
import SystemPromptModal from "./SystemPromptModal";

const CustomInput: React.FC<{
  value: string;
  onChange: (text: string) => void;
  disabled: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean; // Add this line
}> = ({ value, onChange, disabled, onKeyDown, autoFocus }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    onKeyDown={onKeyDown}
    autoFocus={autoFocus} // Add this line
    style={{
      flex: 1,
      width: "100%",
      border: "none",
      padding: "4px",
      borderRadius: "0 0 8px 8px",
      backgroundColor: "#fff",
      resize: "none",
      height: "50px",
    }}
  />
);

const handleSystemPromptSave = (newPrompt: string) => {
  // Here you can implement the logic to update the system prompt
  console.log("New system prompt:", newPrompt);
};

const MessagingWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState<number>(0);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);

  // Reference to the messages end for scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { currentSession } = useSession();

  // Update messages when new SSE data is received

  const handleSend = async (): Promise<void> => {
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: newMessage,
        timestamp: new Date(),
        role: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");
      setIsLoading(true);

      // Immediately add an assistant message with a loading cursor
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1, // Ensure unique ID
          text: "Loading...",
          timestamp: new Date(),
          role: "assistant",
          isStreaming: true,
        },
      ]);

      const apiMessage = newMessage.replace(/\n/g, "\\n"); // Clean input
      // Send the message to the server
      try {
        const response = await fetch("http://127.0.0.1:3001/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: apiMessage, id: currentSession?.id }),
        });

        const reader = response
          .body!.pipeThrough(new TextDecoderStream())
          .getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (
              lastMessage &&
              lastMessage.role === "assistant" &&
              lastMessage.isStreaming
            ) {
              // Merge the new value into the existing assistant message
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  text: lastMessage.text.trimEnd() + value.replace("data:", ""),
                },
              ];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false); // Ensure loading state is reset after final reply
      }
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (
      (event.key === "Enter" || event.key === "Return") &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault(); // Prevent adding a new line
      handleSend(); // Call the send function
    }
  };

  const handleStop = (): void => {
    console.log("stopped");
    setIsLoading(false);
    // Additional logic to stop the API request can be added here
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Window
      title="Claude Chat Room"
      showClose
      showHelp
      showMaximize
      showMinimize
      style={{ height: "100%", display: "flex", flexDirection: "column" }} // Ensure it fills and layouts properly
    >
      {/* Menu Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",

          justifyContent: "space-between",
          padding: "0px 4px 0px 4px",
          borderBottom: "1px solid #a0a0a0",
          background: "#ECE9D8",
          height: "30px", // Set a fixed height
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <a href="#" style={{ textDecoration: "underline", color: "black" }}>
            Restart Session
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsSystemPromptOpen(true);
            }}
            style={{ textDecoration: "underline", color: "black" }}
          >
            Change System Prompt
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1, // Allow this div to expand
          display: "flex",
          flexDirection: "column",
          background: "#354EC0",
          padding: "4px",
          overflow: "hidden", // Ensure content doesn't overflow
          height: "calc(100% - 60px)",
        }}
      >
        {/* Recipient Info */}
        <div style={{ padding: "1px 1px" }}>
          <p style={{ color: "#C4D4FF", fontSize: "12px" }}>
            <strong>To: claude-3-5-sonnet-20241022</strong>
          </p>
        </div>

        <div
          style={{
            flex: 1, // Allow this div to expand
            display: "flex",
            flexDirection: "column",
            overflowY: "auto", // Allow scrolling if content overflows
          }}
        >
          <div
            style={{
              //flex: 1, // Allow this div to expand
              backgroundColor: "#fff",
              marginBottom: "10px",
              padding: "10px",
              borderRadius: "8px 8px 0px 0px",
              height: "70vh",
              overflowY: "auto",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: "10px",
                  textAlign: msg.role === "user" ? "right" : "left",
                  opacity: msg.isStreaming ? 0.7 : 1,
                  width: "100%",
                  whiteSpace: "pre-wrap",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  <strong>
                    {msg.role === "user" ? "User" : "Claude"} Says:
                  </strong>
                </div>
                <div
                  style={{
                    background: msg.role === "user" ? "#e3f2fd" : "#f5f5f5",
                    padding: "8px",
                    borderRadius: "8px",
                    display: "inline-block",
                    maxWidth: "100%",
                    textAlign: "left",
                    whiteSpace: "pre-wrap", // Add this line
                    userSelect: "text",
                  }}
                >
                  {msg.text}
                  {msg.isStreaming && "▊"}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              height: "7vh",
              backgroundColor: "#fff",
              padding: "4px 8px",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <CustomInput
              value={newMessage}
              onChange={setNewMessage}
              disabled={isLoading}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <Button
              onClick={isLoading ? handleStop : handleSend}
              disabled={isLoading}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "4px",
                backgroundColor: "#fff",
                border: "1px solid #7F9DB9",
              }}
            >
              {isLoading ? "Stop ◽" : "Send"}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: "2px 8px",
          borderTop: "1px solid #a0a0a0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ECE9D8",
          height: "30px", // Set a fixed height
        }}
      >
        <span>
          Session duration: {Math.floor(timer / 60)}:
          {(timer % 60).toString().padStart(2, "0")} / 30:00
        </span>
      </div>
      <SystemPromptModal
        isOpen={isSystemPromptOpen}
        onClose={() => setIsSystemPromptOpen(false)}
        onSave={handleSystemPromptSave}
      />
    </Window>
  );
};

export default MessagingWindow;
