import React from "react";
import { ExtendedMessage } from "../types";
import { useSession } from "../SessionContext/session.context";

// Tool icons mapping (using placeholder images)
const TOOL_ICONS: { [key: string]: string } = {
  go_to_url:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAJPSURBVDhPjZHbS9phHMZ/RVIUJZ1VLDErsJNGVHbCMpQOYlQSVBQdCIsCuxg127K20U3URazWgcpSy85mx0Eb7Krb3Y3tr/ksf7qLXW0feK/e7/M83/d5hdDPEDNPMzhuHfRf9mM/tdMR6KDN30b7UTsWnwXjgZG6/TrKt8rRrGhYflpGmH2aZe/7HivPK7i+uJj+PM3E3QRjN2OMXI8wcDVAz3kPtoCNpsMmdOs65LNyhMn7SVafV1n8tojz0YnjxsHQ1RB3v+4IYz2y0upvFUW1e7XoN/TkzuUiDAYHmfs6JyaNXo/Sd95H13GXKPpDxXYF+m09+i29mKiZ1yB0n3Yz9TDF+N04g5eD2E/sWH1WTB5TVBZBu6mleKuY0o1SNO4XYbiI0dAow8Fhes976TzupMXbgtFjpGq3KiqLULhdSNFmEWq3GsHsNdN30Re9+jcFOwXkLOQghJ3D6/4vqn0VsncyhMqdSvG/uk66RAPbiY3WwEuLJ00YzgzR8QjyCzkyr4y092kIJZ9KMB2YxNrD77UGrFgCFhrPGqPjERS3CjKCGUh9UpIWkxDy1vIw7Bpo9jbT4m/BfGTGdPx3o+p7NbIHGSmhFBJ8CUjcEgT5qpxwavVuNQ2eBuo99dQc1uD74RNF+cF8lCEl6TfpJF4mEueJI9YVi5D6IRXVioqitSJ0H3WUrZeJRtodLZp9DUqfkkx/Jsn+ZCQeCTFrMQhOAWHpcQmpU0rWqywUMwrxyF7LyHZlkz6fTvJCMonuROLfxhP75iVpWmDheoHfNvbnLyE6SFEAAAAASUVORK5CYII=",
  save_to_memory:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAgaSURBVGhD7Vh5TJX5FaWpTtVAitaO1tZKNDVWHYXYYN2N6YDFKDI4Csg2aiyiuIthdRRcGTcEWaIDgyiC+4qogKIgJQriBm4guKCIFDRIMpjcnnOZZ8HqlBmq8Y93k5NH3vu+73fOvefe3+/DxBjGMIYxjGEMYxjjI4lJkyZNdHBwCF+6dGnhpk2bZMmSJdfs7OyiRowYMQw/t2m86iMKJycniylTpiycPn364c2bN8vx48eltLRUXr58KQ0NDcJ49OiRHDt2TJYtW/bc0dExefTo0bMGDBjQFbf/ovEpHzBcXV3Np06d6gDiCatWrSpLSEiQixcvyuPHjxXPnj2T2traZgJevXoldXV1UlNTI0+ePJFTp07J6tWrZcaMGf8cOnRogLW19V/x6PdXHU9PT0s3N7eFvr6+WTExMZKbm6tECGa7pKRE7t+/32IB5eXlcvfuXf3k/fv375d169Y9GjduXOygQYOcseSvGlf+mYHMmH+F8PDwSIiIiKg5ceKEVFZWKpmbN2/Kjh07ZNq0aYLFZOzYsbJ27dqfLYDPffHixetrr169qtWxt7dPs7S09OvTp8+fQemXjcx+JGbOnDkaxMNxc2FSUpLk5+frA58/fy5HjhyRRYsWCbyrpInJkyfLihUr5OjRo62qwJsC6uvrpbq6Wh48eCCZmXmyYcMGmTNnTjHExPTv398OVD9pZPxGbNy4UYqKinQhkmDjkQgXNQggdu3aJffu3dPvSbi1FvoxAUVF5VJQUCVXrlyR5ORkwWQTf3//F+PHj08ZOHDgLNBu38geQRtwUrAhSYqESLS4uFju3LkjT58+VXL87fr16/pdWVnZexWQn/9ELl16KZcvX5b169cLhoakpaVJdHSM2Nr+XTp27DgN1E3peQteQAEHDx6UvXv3yunTp6WwsFBJcaFbt26poIqKCqmqqlLy165dkwsXLqhoimLVWiuguroWzyqTrKz7kpNTBRHFcvLkSdmyJVLmz/eVuXP9YasE9KCPdOrU6SgEfGaCZh3DGZ6RkaEKKeTQoUOyb98+nRCZmZmacRInQX6yIlychEimoKBAzpw5I+fOnZPs7GwVdOPGDRVqSAKvY0VpCfYYM8vrc3JysOZJrJkOnAOPAuwnZyUiIhL+ny9ffukiQUFhSjw8PBkVOCheXr6sQBYEjDLBXP9bYGCgKj179qwS5t/clA4fPqxC9uzZIwcOHNARyvJSCAWwIg8fPtTvaCNaisRZPVaHYkiSSWEvMTF8DivNZKWmpurn+fPZ+GSmI5S0o6OTuLlNF09PH/z9FbwfpsS//TZNEhIyxccnyCBgDGDySXBwsPj5+QlmvcTFxamFKISbDhfhtOHCFLJ7924VRgsZqkIBtJihJ1ix27dvq/U4epl5DgmK430clxSZnp6upL28vGXCBAdxcXEX7Ozi7OwsNjZjX0+9kJBoJZ6UlIuEXpaFC1c2E2Cybds2+C5LR2NYWJjMnj0bN4UoaVqDgiikaZ9wMuzcuVN/I2F6mRWhVUic3zMZfG5T4rTq1q1bX5N2d/fgrgybBOnYNJBuirCwRCQvHxUsAo9STKRvmguIjIzUEmPH1UyxMTkyObpwzoH3wrXUb+uTlJQUFcLKkCytxUamhbZv366VZBKioqI0MRiDyLKzwLqyePFiJc7ErVmz5p0CwsP3w9IlSEoF1viXBAZGiJmZ2WlQH60CcIqM9fb2VosYxiRLz6zRw6wKy4o5LKzWu/qEorlTs0JsVIqdN2+eksZRARmfgMx7wcM+uq/Qti0REBvL/qxGUuohoBZ98rWA9l7gLyoAAUFm83CwKsAuW8ejMKtAO1AILcDpER8fr1mjmNDQULXTu/okMTFRCc6a5a0kbG1t9b6WChgyZCiun4lGXizffZeNiVikxK2th7zo0qXLdXCOBv6g7H+IXwN9Afe+ffum2djY1HA6MYsUwqakvSiElsABTI8UtAUPeW/rk+Dgr0HU7ycJwPuE4GgjCxYESEBAOAbLN6icU0OvXr0qTE1Nz4NfErAKsAf+sxv/EDyjmwJ/BOx79OiROHjw4FI+kD6nENqLQmgvznIeqSmCBDnFSNzQJytXroGItS0SwE+uw5Hp779ZvL0DpF+/fprttm3bctOKBeYCQwC+T/wX+TeDF/wOGIVdLwQHqhvw8vfc9PLy8pr1CUciD4EkQq+7uLhohUJCVuN0Ga0C8FaG0Wij/TBx4kTMd0fNNr9zdJyKa7cp8c8/txNm29zcPBdrJwPMtgPwJ8Ac+MnvDjwBdgKsOnTosKBnz56Zw4cPrwsICNAmNvQJCVIAm5fNzCzb2dljgux+7eumGDZsJI4Gy2X58ljx8PARvKXVd+vW7WabNm1SsVY8sAAYBTCJTGar3+B4LmefMBNfdO3aNRlEKjkO2dxsXDa0oU94vIiJicfUSm1G3NXVC2NwC+y2TrPdu3fvp8h2Hp6ZAmwAnIA+ALP99uNzK4OZYEZ+D4zB9FqPpr+L94XvaRtuVoY+iYtLQjVyYKsvlHRo6HYVwGx37969pH379ul4xg5gKcCZzmd2AD7Y+zIz9FtgULt27Xxhr0s4q9exQXlMyMjIRnXOYPwFqWWY7c6dO+fjes7wjYAnYAn8Bngv2W5p0F4sOUvvDi+noSqVI0eOFCsrqwYLC4tyZDsDvzHbfoANwBnOife/Xxk/YDQdwxPgbW42iUAU8A/ACmC2W/fi/oGCffIpwM2R3jYDPqpstzQ+vv/IGcMYxjCGMYxhjP9LmJj8GxEu1G3a5UU1AAAAAElFTkSuQmCC",
  computer:
    "data:image/png;base64,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",
};

interface ChatMessageProps {
  message: ExtendedMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isTool = message.contentType === "tool_use";
  const isSystem = message.contentType === "system";
  const isError = message.contentType === "error";
  const { restartSession, setIsSystemPromptOpen } = useSession();

  // Base styles for all messages
  const baseMessageStyle = {
    maxWidth: "80%",
    marginBottom: "10px",
    opacity: message.isStreaming ? 0.7 : 1,
    alignSelf: isUser ? "flex-end" : "flex-start",
  };

  // Bubble styles for different message types
  const bubbleStyle = (() => {
    if (isSystem || isError) {
      return {
        background: "#fff",
        padding: "12px",
        fontColor: "#B4B4B4",
        whiteSpace: "pre-wrap" as const,
        userSelect: "text" as const,
        cursor: "text",
        position: "relative" as const,
        paddingBottom: "20px", // Space for the separator
      };
    }
    if (isTool) {
      return {
        fontFamily: "monospace",
        color: "#666",
        padding: "8px 12px",
        width: "100%",
        whiteSpace: "pre-wrap" as const,
        userSelect: "text" as const,
        cursor: "text",
      };
    }
    return {
      background: isUser ? "#e3f2fd" : "#f5f5f5",
      padding: "8px 12px",
      borderRadius: isUser ? "12px 12px 0 12px" : "12px 12px 12px 0",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      whiteSpace: "pre-wrap" as const,
      userSelect: "text" as const,
      cursor: "text",
    };
  })();

  // Render system/error messages
  if (isSystem || isError) {
    return (
      <div style={baseMessageStyle}>
        <div style={bubbleStyle}>
          <img
            src={
              isError
                ? "data:image/png;base64,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"
                : "https://cdn.icon-icons.com/icons2/191/PNG/256/MSN_Messenger_23101.png"
            }
            alt={isError ? "Error" : "Info"}
            style={{
              width: "16px",
              height: "16px",
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          <span
            style={{
              color: isError ? "#d32f2f" : "#646464",
              verticalAlign: "middle",
            }}
          >
            {message.text.includes("invalid x-api-key")
              ? "Invalid Anthropic API key"
              : message.text}
            {isError &&
              (message.text.includes("invalid x-api-key") ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSystemPromptOpen(true);
                  }}
                  style={{
                    color: "#d32f2f",
                    textDecoration: "underline",
                    marginLeft: "8px",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Change API Key
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.reload();
                    restartSession();
                  }}
                  style={{
                    color: "#d32f2f",
                    textDecoration: "underline",
                    marginLeft: "8px",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Restart Session
                </button>
              ))}
          </span>
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "12px",
              right: "12px",
              height: "1px",
              background: "#ddd",
            }}
          />
        </div>
      </div>
    );
  }

  const renderToolContent = () => {
    try {
      const inputObj = JSON.parse(message.partialInput || "{}");

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            userSelect: "text", // Makes all tool content selectable
          }}
        >
          {/* Tool Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid #eee",
              paddingBottom: "8px",
            }}
          >
            <img
              src={
                TOOL_ICONS[message.name || ""] ||
                "https://placehold.co/32x32/png?text=🔧"
              }
              alt={message.name}
              style={{
                width: "12px",
                height: "12px",
                objectFit: "contain",
                userSelect: "none", // Prevent image selection
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: "semi-bold",
                color: "#333",
              }}
            >
              {message.name}
            </span>
          </div>

          {/* Tool Inputs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              fontSize: "10px",
            }}
          >
            {Object.entries(inputObj).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  gap: "8px",
                  whiteSpace: "pre-wrap", // Preserve formatting in tool values
                }}
              >
                <span
                  style={{
                    fontWeight: "semi-bold",
                    minWidth: "80px",
                  }}
                >
                  {key}:
                </span>
                <span
                  style={{
                    color: "#666",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {String(value).length > 50
                    ? `${String(value).substring(0, 50)}...`
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      return <div>Invalid input format</div>;
    }
  };

  return (
    <div style={baseMessageStyle}>
      {!isTool && (
        <div
          style={{
            marginBottom: "4px",
            textAlign: isUser ? "right" : "left",
            userSelect: "none", // Prevent selection of the "User/Claude Says:" text
          }}
        >
          <strong>{isUser ? "User" : "Claude"} Says:</strong>
        </div>
      )}
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <div style={bubbleStyle}>
          {isTool ? renderToolContent() : message.text}
          {message.isStreaming && "▊"}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
