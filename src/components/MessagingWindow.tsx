import React, { useEffect, useState, useRef } from "react";
import { Window, Button } from "react-windows-xp";
import { useSession } from "../SessionContext/session.context";
import { ExtendedMessage } from "../types";
import SystemPromptModal from "./SystemPromptModal";
import ChatMessage from "./ChatMessage";

const CustomInput: React.FC<{
  value: string;
  onChange: (text: string) => void;
  disabled: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
}> = ({ value, onChange, disabled, onKeyDown, autoFocus }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    onKeyDown={onKeyDown}
    autoFocus={autoFocus}
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

const MessagingWindow: React.FC = () => {
  // Reference to the messages end for scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change

  const {
    currentSession,
    restartSession,
    chatHistory,
    setChatHistory,
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
    systemPrompt,
    temperature,
    apiKey,
    numImagesToKeep,
    waitTime,
  } = useSession();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update messages when new SSE data is received

  const handleSend = async (): Promise<void> => {
    if (newMessage.trim()) {
      const userMessage: ExtendedMessage = {
        id: Date.now(),
        text: newMessage,
        timestamp: new Date(),
        role: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      const messages = [
        ...chatHistory,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: newMessage,
            },
          ],
        },
      ];
      setChatHistory((prev) => [
        ...prev,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: newMessage,
            },
          ],
        },
      ]);
      setNewMessage("");
      setIsMessageLoading(true);

      try {
        const response = await fetch("http://127.0.0.1:3001/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
            id: currentSession?.id,
            systemPrompt: systemPrompt,
            temperature: temperature,
            numImagesToKeep: numImagesToKeep,
            waitTime: waitTime,
            apiKey: apiKey,
          }),
        });

        const reader = response.body!.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const chunk of lines) {
            // Each chunk is one SSE event
            const event = parseSSEEvent(chunk);
            // Handle the event
            processSSEEvent(event);
          }
        }

        // Process any remaining buffer
        if (buffer.length > 0) {
          const event = parseSSEEvent(buffer);
          processSSEEvent(event);
        }

        // Set loading state to false after the entire response is processed
        setIsMessageLoading(false);
        console.log("===== Loading state set to false =====");
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "An error occurred while processing your request. Please try again.",
            timestamp: new Date(),
            role: "error",
            contentType: "error",
          },
        ]);
        setIsMessageLoading(false);
      }
    }
  };

  // Function to parse SSE events
  function parseSSEEvent(sseChunk: string): { event?: string; data: any } {
    const eventLines = sseChunk.split("\n");
    let eventName = "";
    let dataString = "";
    for (const line of eventLines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataString += line.slice(5).trim();
      }
    }
    let data = null;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      console.error("Failed to parse data", e);
    }
    return { event: eventName, data };
  }

  // Function to process SSE events
  function processSSEEvent(event: { event?: string; data: any }) {
    const { event: eventType, data } = event;

    switch (eventType) {
      case "message_start":
        // Optionally handle message_start
        break;
      case "content_block_start":
        const contentBlock = data.content_block;
        console.log("contentBlock", contentBlock);
        const newMessage: ExtendedMessage = {
          id: Date.now() + data.index,
          text: "",
          timestamp: new Date(),
          role: "assistant",
          isStreaming: true,
          contentType: contentBlock.type,
          contentIndex: data.index,
          partialInput: "",
          name: contentBlock.name, // For 'tool_use' content blocks
          toolUseId: contentBlock.id,
        };
        setMessages((prev) => [...prev, newMessage]);
        break;

      case "content_block_delta":
        const delta = data.delta;
        const contentIndex = data.index;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.contentIndex === contentIndex && msg.isStreaming) {
              if (delta.type === "text_delta") {
                const newText = msg.text + delta.text;
                return {
                  ...msg,
                  // Trim leading newlines only when the message starts
                  text: msg.text === "" ? newText.trimStart() : newText,
                };
              } else if (delta.type === "input_json_delta") {
                return {
                  ...msg,
                  partialInput: (msg.partialInput || "") + delta.partial_json,
                };
              }
            }
            return msg;
          })
        );
        break;

      case "content_block_stop":
        const stopIndex = data.index;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.contentIndex === stopIndex && msg.isStreaming) {
              let updatedText = msg.text;

              if (msg.contentType === "tool_use") {
                try {
                  const inputObj = JSON.parse(msg.partialInput || "{}");
                  updatedText = `Tool used: ${
                    msg.name
                  }\nInput: ${JSON.stringify(inputObj, null, 2)}`;
                  setChatHistory((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === "assistant") {
                      // Check if the content already exists
                      const contentExists = lastMessage.content.some(
                        (item) => item.id === msg.toolUseId
                      );
                      if (!contentExists) {
                        return [
                          ...prev.slice(0, -1),
                          {
                            ...lastMessage,
                            content: [
                              ...lastMessage.content,
                              {
                                id: msg.toolUseId,
                                type: msg.contentType,
                                name: msg.name,
                                input: inputObj,
                              },
                            ],
                          },
                        ];
                      }
                    } else {
                      return [
                        ...prev,
                        {
                          role: "assistant",
                          content: [
                            {
                              id: msg.toolUseId,
                              type: msg.contentType,
                              name: msg.name,
                              input: inputObj,
                            },
                          ],
                        },
                      ];
                    }
                    return prev;
                  });
                } catch (error) {
                  console.error("Failed to parse tool input JSON", error);
                  updatedText = `Tool used: ${msg.name}\nInvalid input JSON`;
                }
              } else {
                setChatHistory((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.role === "assistant") {
                    // Check if the content already exists
                    const contentExists = lastMessage.content.some(
                      (item) =>
                        item.type === msg.contentType &&
                        item.text === updatedText
                    );
                    if (!contentExists) {
                      return [
                        ...prev.slice(0, -1),
                        {
                          ...lastMessage,
                          content: [
                            ...lastMessage.content,
                            {
                              type: msg.contentType,
                              text: updatedText,
                            },
                          ],
                        },
                      ];
                    }
                  } else {
                    return [
                      ...prev,
                      {
                        role: "assistant",
                        content: [
                          {
                            type: msg.contentType,
                            text: updatedText,
                          },
                        ],
                      },
                    ];
                  }
                  return prev;
                });
              }

              return {
                ...msg,
                text: updatedText,
                isStreaming: false,
              };
            }
            return msg;
          })
        );
        break;

      case "message_stop":
        // Reset streaming state for all messages
        setMessages((prev) =>
          prev.map((msg) =>
            msg.isStreaming
              ? {
                  ...msg,
                  isStreaming: false,
                }
              : msg
          )
        );
        break;

      default:
        break;
    }
  }

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
    setIsMessageLoading(false);
    // Additional logic to stop the API request can be added here
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Adjusted rendering logic
  return (
    <Window
      title="Claude Chat Room"
      showClose
      showHelp
      showMaximize
      showMinimize
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
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
          height: "30px",
        }}
      >
        <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
          <button
            style={{
              textDecoration: "underline",
              color: "black",
              border: "none",
              background: "none",
              padding: "0px",
              margin: "0px",
              cursor: "pointer",
            }}
            onClick={() => {
              restartSession();
            }}
          >
            Restart Session
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsSystemPromptOpen(true);
            }}
            style={{
              textDecoration: "underline",
              color: "black",
              border: "none",
              background: "none",
              padding: "0px",
              margin: "0px",
              cursor: "pointer",
            }}
          >
            Change System Prompt
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#354EC0",
          padding: "4px",
          overflow: "hidden",
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
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              marginBottom: "10px",
              padding: "10px",
              borderRadius: "8px 8px 0px 0px",
              height: "70vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
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
              disabled={isMessageLoading}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <Button
              onClick={isMessageLoading ? handleStop : handleSend}
              disabled={isMessageLoading}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "4px",
                backgroundColor: "#fff",
                border: "1px solid #7F9DB9",
              }}
            >
              {isMessageLoading ? "Stop ◽" : "Send"}
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
          height: "30px",
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
      />
    </Window>
  );
};

export default MessagingWindow;
