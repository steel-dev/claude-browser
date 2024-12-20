import React, { useState } from "react";
import BrowserWindow from "./components/BrowserWindow.tsx";
import MessagingWindow from "./components/MessagingWindow.tsx";
import { Wallpaper, Window, Button, TextBox } from "react-windows-xp";
import { useSession } from "./SessionContext/session.context";
import LoadingModal from "./components/LoadingModal";
import "./App.css";

const App: React.FC = () => {
  const { currentSession, startSession, setClaudeAPIKey, isSessionLoading } =
    useSession();
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      setClaudeAPIKey(inputValue.trim());
      await startSession();
    } else {
      alert("Please enter a valid API key");
    }
  };

  if (!currentSession) {
    // Render the popup window
    return (
      <Wallpaper fullScreen>
        <LoadingModal isOpen={isSessionLoading} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Window
            title="Welcome to Claude Browser"
            showClose={false}
            showMaximize={false}
            showMinimize={false}
            style={{ width: "400px", height: "auto" }}
          >
            <div style={{ padding: "20px", textAlign: "center" }}>
              <img
                src="https://api.scalar.com/cdn/images/jBw8j7D0nDuWr2AD2vuO5/D-Yt182xdIQAAQph6XjuT.png" // Replace with your image URL
                alt="Welcome"
                style={{ width: "100px", marginBottom: "20px" }}
              />
              <div style={{ marginBottom: "20px" }}>
                <p>
                  <b>Welcome to the Claude Browser Assistant!</b>
                </p>
                <p>
                  This is a demo app of Anthropic's new{" "}
                  <a href="https://x.com/AnthropicAI/status/1848742752403476488">
                    Computer Use model API
                  </a>
                  (upgraded claude 3.5 sonnet) refactored to control a browser
                  in the cloud. Powered by{" "}
                  <a href="https://steel.dev">steel.dev</a>.
                </p>
                <p>
                  Give it a try and let claude be your AI browsing assistant,
                  capable of understanding/interacting with any website and
                  executing long running tasks. Note that tools you may have
                  seen in demos like the bash and file system navigation are not
                  supported yet.
                </p>
              </div>
              <hr style={{ margin: "0px 0", border: "0.5px solid #a0a0a0" }} />
              <div
                style={{
                  display: "flex",
                  gap: "0px",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1, padding: "10px", textAlign: "left" }}>
                  <p>
                    Steel.dev is an open-source browser API purpose-built for AI
                    agents.
                  </p>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "10px",
                    textAlign: "right",
                  }}
                >
                  <a
                    href="https://tally.so/r/mZR6ZB"
                    style={{
                      color: "black",
                      fontWeight: "bold",
                      textDecoration: "underline",
                    }}
                  >
                    Join the waitlist.
                  </a>
                </div>
              </div>

              <hr style={{ margin: "0px 0", border: "0.5px solid #a0a0a0" }} />
              <p style={{ textAlign: "left" }}>
                Please enter your Anthropic API key to get started!
              </p>
              <p style={{ textAlign: "left" }}>
                You can get your key from{" "}
                <a href="https://console.anthropic.com/settings/keys">here</a>.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <TextBox
                  id="api-key-input"
                  label="Your Anthropic API Key"
                  value={inputValue}
                  onChange={(text: string) => setInputValue(text)}
                  placeholder="Enter API Key"
                />
                <Button onClick={handleSubmit}>
                  Start Browser Session (30 mins)
                </Button>
              </div>
            </div>
          </Window>
        </div>
      </Wallpaper>
    );
  }

  // Render the main application once API key is submitted
  return (
    <Wallpaper fullScreen>
      <LoadingModal isOpen={isSessionLoading} />
      <div className="app-container">
        <div className="messaging-window">
          <MessagingWindow />
        </div>
        <div className="browser-window">
          <BrowserWindow />
        </div>
      </div>
    </Wallpaper>
  );
};

export default App;
