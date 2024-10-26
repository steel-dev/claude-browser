import React, { useState, useEffect } from "react";
import { Window, Button, TextBox } from "react-windows-xp";
import { useSession } from "../SessionContext/session.context";

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({ isOpen, onClose }) => {
  const {
    systemPrompt: sessionSystemPrompt,
    temperature: sessionTemperature,
    numImagesToKeep: sessionNumImagesToKeep,
    waitTime: sessionWaitTime,
    apiKey: sessionClaudeAPIKey,
    save,
    restartSession,
  } = useSession();

  // Local component state for form fields
  const [localSystemPrompt, setLocalSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [numImagesToKeep, setNumImagesToKeep] = useState<number>(10);
  const [waitTime, setWaitTime] = useState<number>(1);
  const [claudeAPIKey, setClaudeAPIKey] = useState("");

  // Add state for temporary temperature input
  const [tempInput, setTempInput] = useState<string>("");

  // Initialize local state from session context when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSystemPrompt(sessionSystemPrompt || "");
      setTemperature(sessionTemperature || 0.7);
      setTempInput((sessionTemperature || 0.7).toString());
      setNumImagesToKeep(sessionNumImagesToKeep || 10);
      setWaitTime(Math.max(1, (sessionWaitTime || 1000) / 1000)); // Ensure minimum of 1 second
      setClaudeAPIKey(sessionClaudeAPIKey || "");
    }
  }, [
    isOpen,
    sessionSystemPrompt,
    sessionTemperature,
    sessionNumImagesToKeep,
    sessionWaitTime,
    sessionClaudeAPIKey,
  ]);

  if (!isOpen) return null;

  // Input change handlers with validation
  const handleTemperatureChange = (value: string) => {
    setTempInput(value); // Allow any input while typing
  };

  const handleTemperatureBlur = () => {
    const numValue = parseFloat(tempInput);
    if (isNaN(numValue) || numValue < 0 || numValue > 1) {
      // Invalid input, reset to default
      setTemperature(1);
      setTempInput("1");
    } else {
      // Valid input, update temperature
      setTemperature(numValue);
      setTempInput(numValue.toString());
    }
  };

  const handleNumImagesToKeepChange = (value: string) => {
    if (value === "") {
      // If input is empty, set number of images to zero
      setNumImagesToKeep(1);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setNumImagesToKeep(numValue);
      }
    }
  };

  const handleWaitTimeChange = (value: string) => {
    if (value === "") {
      // If input is empty, set wait time to zero
      setWaitTime(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setWaitTime(numValue);
      }
    }
  };

  const handleClaudeAPIKeyChange = (value: string) => {
    setClaudeAPIKey(value);
  };

  const handleLocalSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalSystemPrompt(e.target.value);
  };

  // Save changes to session context when user clicks "Save"
  const handleSave = () => {

    save({
      prompt: localSystemPrompt,
      temperature: temperature,
      numImagesToKeep: numImagesToKeep,
      waitTime: waitTime,
      apiKey: claudeAPIKey,
    });
    onClose();
    restartSession();
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
        title="Agent Settings"
        showClose
        onClose={onClose}
        style={{
          width: "500px",
          height: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "16px" }}>
          {/* System Prompt */}
          <p style={{ marginBottom: "8px" }}>Edit the system prompt below:</p>
          <textarea
            value={localSystemPrompt}
            onChange={handleLocalSystemPromptChange}
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
          <p style={{ marginBottom: "8px" }}>
            Note: We automatically append the current datetime + memory to the bottom of the system prompt.
          </p>

          {/* Form Fields */}
          <div style={{ marginTop: "16px" }}>
            <TextBox
              id="text-temperature"
              label="Temperature"
              onChange={handleTemperatureChange}
              onBlur={handleTemperatureBlur}
              placeholder="1"
              value={tempInput}
              stacked
            />
            <TextBox
              id="text-num-images"
              label="Number of Images to Keep"
              onChange={handleNumImagesToKeepChange}
              placeholder="10"
              value={numImagesToKeep.toString()}
              stacked
            />
            <TextBox
              id="text-wait-time"
              label="Wait Time Between Actions (seconds)"
              onChange={handleWaitTimeChange}
              placeholder="1"
              value={waitTime.toString()}
              stacked
            />
            <TextBox
              id="text-api-key"
              label="Claude API Key"
              onChange={handleClaudeAPIKeyChange}
              placeholder="sk-ant-api03-..."
              value={claudeAPIKey}
              stacked
              type="password"
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes and Restart Session</Button>
          </div>
        </div>
      </Window>
    </div>
  );
};

export default SystemPromptModal;
