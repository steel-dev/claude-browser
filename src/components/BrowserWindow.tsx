import React, { useEffect, useRef, useState } from "react";
import { Window, TextBox } from "react-windows-xp";
import { useSession } from "../SessionContext/session.context";
import { useSSE } from "../hooks/useSSE";
// import rrwebPlayer from "rrweb-player";
// import "rrweb-player/dist/style.css";

const BrowserWindow: React.FC = () => {
  // const { time, error } = useTime();
  const { currentSession } = useSession();
  const [url, setUrl] = useState("about:blank");
  const frame = useSSE(
    `http://127.0.0.1:3001/live-viewer/${currentSession?.id}`
  );

  const event = useSSE(`http://127.0.0.1:3001/events/${currentSession?.id}`);
  const [events, setEvents] = useState<any[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  // const playerRef = useRef<rrwebPlayer | null>(null);
  // const containerRef = useRef<HTMLDivElement>(null);
  // const playerCreatedRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [latestImage, setLatestImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (frame && frame.data && parentRef.current) {
      const img = new Image();
      img.onload = () => {
        const parentWidth = parentRef.current?.clientWidth || 0;
        const scale = parentWidth / img.width;
        const scaledHeight = img.height * scale;
        setCanvasSize({ width: parentWidth, height: scaledHeight });
        setLatestImage(img);
      };
      img.onerror = (e) => {
        console.error("Error loading image:", e);
      };
      img.src = `data:image/jpeg;base64,${frame.data}`;
    }
  }, [frame]);

  useEffect(() => {
    const renderFrame = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx && latestImage && canvasSize) {
        ctx.drawImage(latestImage, 0, 0, canvasSize.width, canvasSize.height);
      }
      requestAnimationFrame(renderFrame);
    };
    renderFrame();
  }, [latestImage, canvasSize]);

  useEffect(() => {
    console.log("event", event);
    if (event && event.data) {
      setUrl(event.data.href);
    }
  }, [event]);

  // useEffect(() => {
  // if (frame) {
  //   console.log(
  //     `Current time: ${Date.now()}, frame time: ${
  //       frame.timestamp
  //     }, Difference: ${Date.now() - frame.timestamp}, type: ${
  //       frame.type
  //     }, player time: ${playerRef.current?.getReplayer().getCurrentTime()},
  //     difference: ${
  //       (playerRef.current?.getReplayer().getCurrentTime() || 0) -
  //       frame.timestamp
  //     }`
  //   );
  //   if (frame.type === 4) {
  //     console.log("frame", frame);
  //     setUrl(frame.data.href);
  //   }
  //   if (playerCreatedRef.current) {
  //     playerRef.current?.addEvent(frame);
  //   } else {
  //     setEvents((prev) => [...prev, frame]);
  //   }
  // }

  // if (frame) {
  //   const img = new Image();
  //   img.src = `data:image/jpeg;base64,${frame.data}`;
  //   setLatestImage(img);
  // }
  // }, [frame]);

  useEffect(() => {
    // if (
    //   events.length > 0 &&
    //   !playerCreatedRef.current &&
    //   containerRef.current
    // ) {
    //   playerRef.current = new rrwebPlayer({
    //     target: containerRef.current,
    //     props: {
    //       events,
    //       skipInactive: true,
    //       liveMode: true,
    //       width: parentRef.current?.clientWidth,
    //       height: parentRef.current?.clientHeight,
    //       mouseTail: false,
    //       showController: false,
    //     },
    //   });
    //   const BUFFER_MS = 350;
    //   playerRef.current.getReplayer().play(Date.now() - BUFFER_MS);
    //   playerCreatedRef.current = true;
    // }
    // return () => {
    //   if (playerRef.current) {
    //     playerRef.current = null;
    //     playerCreatedRef.current = false;
    //   }
    // };
  }, [events]);

  return (
    <Window
      title={`Steel Browser - Session ID: ${currentSession?.id}`}
      showClose
      showMaximize
      showMinimize
      showHelp
      style={{ height: "fit-content", width: "100%" }} // Ensure it fills the parent
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Menu Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px",
            borderBottom: "1px solid #a0a0a0",
            background: "#ECE9D8",
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Favorites</span>
            <span>Tools</span>
            <span>Help</span>
          </div>
          <img
            src="https://seeklogo.com/images/W/windows-xp-icon-logo-E8F84DD6F3-seeklogo.com.png"
            alt="Windows"
            style={{ width: "16px", height: "16px" }}
          />
        </div>

        {/* Address Bar */}
        <div
          style={{
            display: "flex",
            padding: "4px 8px",
            gap: "8px",
            borderBottom: "1px solid #a0a0a0",
            alignItems: "center",
          }}
        >
          <span>Address</span>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "white",
              border: "1px solid #7F9DB9",
            }}
          >
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA8UlEQVR42pWSsQ2DMBBFrYiNbhZqqngFWlfs4G0YwHVWQKIKZZTC8b/kHHMYSCx9YYHf88dgTDH6vo/DMJzG7A0Izob3PrZtG48Fz/tuIMC1KtECYwOnFAAkohylcBkqYbIxLsvC8xACt8BmqoWLNj3waQHRO4ljicC4zvOcJYXApRtY7leVITHhKwGMTNONJVnA7x48V9WvICnhlQBwSLtTWiQCaSDVAWIOcNOg6zqub+jdABnHkcNnwVK/38A58zk0m4EyGq6eAcDL9RGbpuEAktTgjUAk8iPpz6bhqkC+huxYAho+FODBr6kKcPOfvACzZogqWb89XgAAAABJRU5ErkJggg=="
              alt=""
              style={{ width: "16px", height: "16px", margin: "0 4px" }}
            />
            <TextBox
              id="address"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
              }}
              value={url}
            />
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAJPSURBVDhPjZHbS9phHMZ/RVIUJZ1VLDErsJNGVHbCMpQOYlQSVBQdCIsCuxg127K20U3URazWgcpSy85mx0Eb7Krb3Y3tr/ksf7qLXW0feK/e7/M83/d5hdDPEDNPMzhuHfRf9mM/tdMR6KDN30b7UTsWnwXjgZG6/TrKt8rRrGhYflpGmH2aZe/7HivPK7i+uJj+PM3E3QRjN2OMXI8wcDVAz3kPtoCNpsMmdOs65LNyhMn7SVafV1n8tojz0YnjxsHQ1RB3v+4IYz2y0upvFUW1e7XoN/TkzuUiDAYHmfs6JyaNXo/Sd95H13GXKPpDxXYF+m09+i29mKiZ1yB0n3Yz9TDF+N04g5eD2E/sWH1WTB5TVBZBu6mleKuY0o1SNO4XYbiI0dAow8Fhes976TzupMXbgtFjpGq3KiqLULhdSNFmEWq3GsHsNdN30Re9+jcFOwXkLOQghJ3D6/4vqn0VsncyhMqdSvG/uk66RAPbiY3WwEuLJ00YzgzR8QjyCzkyr4y092kIJZ9KMB2YxNrD77UGrFgCFhrPGqPjERS3CjKCGUh9UpIWkxDy1vIw7Bpo9jbT4m/BfGTGdPx3o+p7NbIHGSmhFBJ8CUjcEgT5qpxwavVuNQ2eBuo99dQc1uD74RNF+cF8lCEl6TfpJF4mEueJI9YVi5D6IRXVioqitSJ0H3WUrZeJRtodLZp9DUqfkkx/Jsn+ZCQeCTFrMQhOAWHpcQmpU0rWqywUMwrxyF7LyHZlkz6fTvJCMonuROLfxhP75iVpWmDheoHfNvbnLyE6SFEAAAAASUVORK5CYII="
              alt="Go"
              style={{ width: "16px", height: "16px" }}
            />
            Go
          </button>
          <span>Links</span>
        </div>

        {/* Content Area */}
        <div
          ref={parentRef}
          style={{
            flex: 1,
            height: "fit-content",
            backgroundColor: "#fff",
          }}
        >
          {/* <div
            ref={containerRef}
            style={{ width: "100%", maxHeight: "100%" }}
          /> */}
          <canvas
            ref={canvasRef}
            width={canvasSize?.width}
            height={canvasSize?.height}
            style={{
              minWidth: "400px",
              minHeight: "300px",
              objectFit: "contain",
              maxHeight: "calc(100vh - 100px)",
            }}
          />
        </div>

        {/* Status Bar */}
        <div
          style={{
            padding: "2px 8px",
            borderTop: "1px solid #a0a0a0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA8UlEQVR42pWSsQ2DMBBFrYiNbhZqqngFWlfs4G0YwHVWQKIKZZTC8b/kHHMYSCx9YYHf88dgTDH6vo/DMJzG7A0Izob3PrZtG48Fz/tuIMC1KtECYwOnFAAkohylcBkqYbIxLsvC8xACt8BmqoWLNj3waQHRO4ljicC4zvOcJYXApRtY7leVITHhKwGMTNONJVnA7x48V9WvICnhlQBwSLtTWiQCaSDVAWIOcNOg6zqub+jdABnHkcNnwVK/38A58zk0m4EyGq6eAcDL9RGbpuEAktTgjUAk8iPpz6bhqkC+huxYAho+FODBr6kKcPOfvACzZogqWb89XgAAAABJRU5ErkJggg=="
              alt=""
              style={{ width: "16px", height: "16px" }}
            />
            <span>Done</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgklEQVR42s2TQQ6AIAwE+/R9Gj9bLQLaUqskHixpSKwzmA2K/LYA0PcSqFVKoejCpSURKTigvgzMJriR1M/sL/MCGVh3YQzXId2JtPCYOYkRTH3MTCZrgiDQUDACczJEgfoc9ofzKS6TVNAkVgDbKdwFSATnHchuJZ5Avv0dGPT3tQGt6vGOoDIgSwAAAABJRU5ErkJggg=="
              alt=""
              style={{ width: "16px", height: "16px" }}
            />
            <span>Internet</span>
          </div>
        </div>
      </div>
    </Window>
  );
};

export default BrowserWindow;
