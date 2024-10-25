import { run } from "./browser_agent_service/index";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { FastifySSEPlugin } from "fastify-sse-v2";
import Steel from "steel-sdk";
import { env } from "./env";

export const steel = new Steel({
  steelAPIKey: process.env.STEEL_API_KEY,
  baseURL: "https://steel-api-staging.fly.dev",
});

const fastify = Fastify({
  logger: true,
});

// Define request interface
interface ChatRequest {
  Body: {
    query: string;
    id: string;
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
      sessionTimeout: 90000,
      solveCaptcha: true,
    });
    reply.send(session);
  },
});

fastify.get("/live-viewer/:id", {
  handler: async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const ws = new WebSocket(
      `ws://steel-api-staging.fly.dev/v1/sessions/${id}/cast?apiKey=${env.STEEL_API_KEY}`
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
        console.log("metadata", event.metadata);
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

// Define route
fastify.post("/api/chat", {
  schema: {
    body: {
      type: "object",
      required: ["query", "id"],
      properties: {
        query: { type: "string" },
        id: { type: "string" },
      },
    },
  },
  handler: async (
    request: FastifyRequest<ChatRequest>,
    reply: FastifyReply
  ) => {
    const { query, id } = request.body;
    // Set headers for Server-Sent Events
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    // Create a callback function to handle streaming outputs
    const onAgentOutput = (event: any) => {
      reply.sse({ event: event.type, data: JSON.stringify(event) });
    };

    try {
      await run({ query, id }, onAgentOutput);
    } catch (error) {
      console.error("Error in AI agent:", error);
      reply.sse({ event: 'error', data: 'An error occurred' });
    } finally {
      reply.sseContext.source.end();
    }
  },
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
