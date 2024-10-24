import React, { useEffect, useState } from "react";
import { Window, TextBox, Button } from "react-windows-xp";
import { Message } from "../types";
import { streamMessage } from "../api/claudeAPI";

const useSSE = (url: string) => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      setData(event.data);
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

const MessagingWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

      // Send the message to the server
      try {
        const response = await fetch("http://127.0.0.1:3001/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: newMessage }),
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
                  text:
                    lastMessage.text.trimEnd() +
                    value.replace("data:", "").replace("\n", ""),
                },
              ];
            } else {
              // Add a new assistant message if none exists
              return [
                ...prev,
                {
                  id: Date.now(),
                  text: value.replace("retry: 3000", "").replace("data:", ""),
                  timestamp: new Date(),
                  role: "assistant",
                  isStreaming: true,
                },
              ];
            }
          });
          console.log("Received", value);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Window
      title="claude-3-5-sonnet-20241022"
      showClose
      showHelp
      showMaximize
      showMinimize
      style={{ height: "100%" }}
    >
      <div
        style={{
          padding: "20px",
          height: "calc(100% - 40px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#fff",
            marginBottom: "10px",
            padding: "10px",
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
              }}
            >
              <div
                style={{
                  marginBottom: "4px", // Add spacing between timestamp and message
                }}
              >
                <strong>
                  {msg.timestamp.toLocaleTimeString()} - {msg.role}:
                </strong>
              </div>
              <div
                style={{
                  background: msg.role === "user" ? "#e3f2fd" : "#f5f5f5",
                  padding: "8px",
                  borderRadius: "8px",
                  display: "inline-block",
                  maxWidth: "80%",
                  textAlign: "left",
                }}
              >
                {msg.text}
                {msg.isStreaming && "▊"}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", width: "100%", gap: "10px" }}>
          <TextBox
            id="message-input"
            value={newMessage}
            onChange={(text: string) => setNewMessage(text)}
            style={{ flex: 1, width: "100%" }}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </Window>
  );
};

export default MessagingWindow;
