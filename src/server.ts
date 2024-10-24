import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import { run } from './browser_agent_service/index';
import dotenv from 'dotenv';

dotenv.config();

const fastify: FastifyInstance = Fastify({
  logger: true
});

// Define request interface
interface ChatRequest {
  Body: {
    query: string;
  }
}

// Enable CORS
fastify.register(fastifyCors, { 
  origin: '*'
});

// Define route
fastify.post('/api/chat', {
  schema: {
    body: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' }
      }
    }
  },
  handler: async (request: FastifyRequest<ChatRequest>, reply: FastifyReply) => {
    const { query } = request.body;
    // Set headers for Server-Sent Events
    reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
  
      // Create a callback function to handle streaming outputs
      const onAgentOutput = (data: string) => {
        reply.raw.write(`data: ${JSON.stringify({ message: data })}\n\n`);
      };
    
      try {
        await run({ query }, onAgentOutput);
      } catch (error) {
        console.error('Error in AI agent:', error);
        reply.raw.write(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`);
      } finally {
        reply.raw.end();
      }
  }
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