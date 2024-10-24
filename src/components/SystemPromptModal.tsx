import React, { useState } from "react";
import { Window, Button } from "react-windows-xp";

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: string) => void;
  initialPrompt?: string;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPrompt = "You are Claude, an AI assistant. You are controlling a browser in the cloud using steel.dev's browser API. You can help users by browsing the web and performing tasks for them.",
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(prompt);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <Window
        title="System Prompt"
        showClose
        onClose={onClose}
        style={{ width: "500px", height: "auto" }}
      >
        <div style={{ padding: "16px" }}>
          <p style={{ marginBottom: "8px" }}>Edit the system prompt below:</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              width: "100%",
              height: "200px",
              padding: "8px",
              border: "1px solid #7F9DB9",
              borderRadius: "3px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Window>
    </div>
  );
};

export default SystemPromptModal;
