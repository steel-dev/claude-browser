import { releaseSession, run } from "./browser_agent_service/index";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { FastifySSEPlugin } from "fastify-sse-v2";
import Steel from "steel-sdk";
import { env } from "./env";
import EventEmitter from "events";

export const steel = new Steel({
  steelAPIKey: env.STEEL_API_KEY,
  baseURL: env.API_URL,
});

const fastify = Fastify({
  logger: true,
  bodyLimit: 104857600,
});

export const messenger = new EventEmitter().setMaxListeners(0);

// Define request interface
interface ChatRequest {
  Body: {
    messages: any[];
    id: string;
    systemPrompt?: string;
    temperature?: number;
    numImagesToKeep?: number;
    waitTime?: number;
    apiKey?: string;
  };
}

fastify.register(FastifySSEPlugin);
fastify.register(cors, {
  allowedHeaders: "*",
  origin: "*",
});

fastify.post("/new-session", {
  handler: async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await steel.sessions.create({
      sessionTimeout: 900000,
    });
    reply.send(session);
  },
});

fastify.get("/release-session/:id", {
  handler: async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const session = await releaseSession(request.params.id);
      reply.send(session);
    } catch (e) {
      reply.status(500).send({ error: "Failed to release session" });
    }
  },
});

fastify.get("/live-viewer/:id", {
  handler: async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    console.log(
      "WEBSOCKET URL",
      `${env.WEBSOCKET_URL}/v1/sessions/${id}/cast?apiKey=${env.STEEL_API_KEY}`
    );
    const ws = new WebSocket(
      `${env.WEBSOCKET_URL}/v1/sessions/${id}/cast?apiKey=${env.STEEL_API_KEY}`
    );

    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    };
    reply.raw.writeHead(200, headers);

    ws.onopen = () => {
      console.log("WebSocket opened");
      reply.sse({ data: JSON.stringify({ type: "open" }) });
    };

    ws.onmessage = (message) => {
      const events = JSON.parse(message.data);
      events.forEach((event: any) => {
        reply.sse({ data: JSON.stringify(event) });
      });
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      reply.sse({ data: JSON.stringify({ type: "close" }) });
      reply.sseContext.source.end();
    };
  },
});

fastify.get("/events/:id", {
  handler: async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    };
    reply.raw.writeHead(200, headers);

    messenger.on("url-changed", (data) => {
      if (data.id === id) {
        reply.sse({ data: JSON.stringify(data) });
      }
    });
  },
});

fastify.get("/tool-results/:id", {
  handler: async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;

    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    };
    reply.raw.writeHead(200, headers);

    messenger.on("tool-result", (data) => {
      if (data.id === id) {
        reply.sse({ data: JSON.stringify(data.message) });
      }
    });
  },
});

// Define route
fastify.post("/api/chat", {
  schema: {
    body: {
      type: "object",
      required: ["messages", "id"],
      properties: {
        messages: { type: "array" },
        id: { type: "string" },
        systemPrompt: { type: "string" },
      },
    },
  },
  handler: async (
    request: FastifyRequest<ChatRequest>,
    reply: FastifyReply
  ) => {
    const {
      messages,
      id,
      systemPrompt,
      temperature,
      numImagesToKeep,
      waitTime,
      apiKey,
    } = request.body;
    // Set headers for Server-Sent Events
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    // Create a callback function to handle streaming outputs
    const onAgentOutput = (event: any) => {
      reply.sse({ event: event.type, data: JSON.stringify(event) });
    };

    try {
      await run(
        {
          messages,
          id,
          systemPrompt,
          temperature,
          numImagesToKeep,
          waitTime,
          apiKey,
        },
        onAgentOutput
      );
    } catch (error) {
      console.error("Error in AI agent:", error);
      reply.sse({ event: "error", data: "An error occurred" });
    } finally {
      reply.sseContext.source.end();
    }
  },
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ host: "0.0.0.0", port: 3001 });
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
