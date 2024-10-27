import React from "react";
import { Window } from "react-windows-xp";
import { useSession } from "../SessionContext/session.context";

const LoadingModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const { isRestartingSession } = useSession();
  if (!isOpen) return null;

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
        title={
          isRestartingSession ? "Restarting Session..." : "Starting Session..."
        }
        showClose={false}
        showMaximize={false}
        showMinimize={false}
        style={{ width: "300px", height: "auto" }}
      >
        <div style={{ padding: "20px", textAlign: "center" }}>
          <img
            src="https://media.tenor.com/CDo9rXaH6GYAAAAj/windows-logo.gif"
            alt="Loading..."
            style={{ width: "50px", marginBottom: "10px" }}
          />
          <p>
            {isRestartingSession
              ? "Restarting your session..."
              : "Initializing your session......"}
          </p>
        </div>
      </Window>
    </div>
  );
};

export default LoadingModal;
