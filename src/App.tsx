import React, { useState } from "react";
import "./App.css"; // Import the CSS file
import TimeDisplay from "./components/BrowserWindow.tsx";
import MessagingWindow from "./components/MessagingWindow.tsx";
import { Wallpaper, Window, Button, TextBox } from "react-windows-xp";

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeySubmitted, setIsApiKeySubmitted] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = () => {
    
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
      setIsApiKeySubmitted(true);
    } else {
      alert("Please enter a valid API key");
    }
  };

  if (!isApiKeySubmitted) {
    // Render the popup window
    return (
      <Wallpaper fullScreen>
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
                  <b>Welcome to the Claude Browser!</b>
                </p>
                <p>
                  This is a demo of Claude the newest version of Anthropic's
                  Computer use model API controlling a browser in the cloud.
                  Powered by <a href="https://steel.dev">steel.dev</a>.
                </p>
                <p>
                  We've mapped the computer use tools controls to puppeteer
                  actions to drive the browser. Note that tools you may have
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
                <div style={{ flex: 1, padding: "10px", textAlign: "right" }}>
                  <a
                    href="https://steel.dev"
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
      <div className="app-container">
      <div className="messaging-window">
          <MessagingWindow />
        </div>
        <div className="browser-window">
          <TimeDisplay />
        </div>
        
      </div>
    </Wallpaper>
  );
};

export default App;
