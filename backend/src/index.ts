import express from 'express';
import { config } from 'dotenv';
import AnthropicApi from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import basicAuth from 'express-basic-auth';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Set up Anthropic client
const anthropic = new AnthropicApi({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Basic authentication middleware
const auth = basicAuth({
  users: { [process.env.AUTH_USERNAME || 'admin']: process.env.AUTH_PASSWORD || 'password' },
  challenge: true,
});

app.use(express.json());
app.use(auth);

// Load system prompt
let systemPrompt: string;

async function loadSystemPrompt() {
  try {
    systemPrompt = await fs.readFile('system_prompt.txt', 'utf-8');
  } catch (error) {
    console.error('Failed to load system prompt:', error);
    process.exit(1);
  }
}

// Endpoint for chat interaction
app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required' });
  }

  try {
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: messages,
      system: systemPrompt,
      stream: true,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        res.write(`data: ${JSON.stringify(chunk.delta)}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error interacting with Anthropic API:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

// Start the server
async function startServer() {
  await loadSystemPrompt();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();
