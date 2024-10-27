import "dotenv/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION || "",
  STEEL_API_KEY: process.env.STEEL_API_KEY || "",
  WEBSOCKET_URL: process.env.WEBSOCKET_URL || "wss://connect.steel.dev",
  API_URL: process.env.API_URL || "https://api.steel.dev",
};
