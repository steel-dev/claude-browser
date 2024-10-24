import { run } from "./browser_agent_service/index";
import dotenv from "dotenv";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { FastifySSEPlugin } from "fastify-sse-v2";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Define request interface
interface ChatRequest {
  Body: {
    query: string;
  };
}

fastify.register(FastifySSEPlugin);
fastify.register(cors, {
  origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
  methods: ["GET", "POST"],
});

// Define route
fastify.post("/api/chat", {
  schema: {
    body: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string" },
      },
    },
  },
  handler: async (
    request: FastifyRequest<ChatRequest>,
    reply: FastifyReply
  ) => {
    const { query } = request.body;
    // Set headers for Server-Sent Events

    // Create a callback function to handle streaming outputs
    const onAgentOutput = (data: string) => {
      reply.sse({ data });
    };

    try {
      await run({ query }, onAgentOutput);
    } catch (error) {
      console.error("Error in AI agent:", error);
      reply.sse({ data: "An error occurred" });
    } finally {
      reply.sseContext.source.end();
    }
  },
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
